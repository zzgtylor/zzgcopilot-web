import { CheckmarkCircleIcon } from '@sanity/icons/CheckmarkCircle'
import { ResetIcon } from '@sanity/icons/Reset'
import { TransferIcon } from '@sanity/icons/Transfer'
import type { DocumentActionComponent, SanityDocument } from 'sanity'
import { useCurrentUser, useDocumentOperation } from 'sanity'

type EditorialStage = 'writing' | 'review' | 'approved'

function stageOf(document: SanityDocument | null): EditorialStage {
  const value = document?.editorialStage
  return value === 'review' || value === 'approved' ? value : 'writing'
}

export function hasApprovalRole(roles: Array<{ name?: string; title?: string }> = []) {
  return roles.some(role => ['administrator', 'editor', 'developer'].includes((role.name || role.title || '').toLowerCase()))
}

export const SubmitForReviewAction: DocumentActionComponent = props => {
  const currentUser = useCurrentUser()
  const { patch } = useDocumentOperation(props.id, props.type)
  const stage = stageOf(props.draft || props.published)
  if (!currentUser || stage !== 'writing') return null

  return {
    label: '提交审核',
    icon: TransferIcon,
    disabled: Boolean(patch.disabled),
    onHandle: () => {
      patch.execute([{ set: { editorialStage: 'review' } }, { unset: ['reviewerName', 'approvedAt'] }])
      props.onComplete()
    },
  }
}

export const ApproveAction: DocumentActionComponent = props => {
  const currentUser = useCurrentUser()
  const { patch } = useDocumentOperation(props.id, props.type)
  const stage = stageOf(props.draft || props.published)
  if (!currentUser || !hasApprovalRole(currentUser.roles) || stage !== 'review') return null

  return {
    label: '批准内容',
    icon: CheckmarkCircleIcon,
    tone: 'positive',
    disabled: Boolean(patch.disabled),
    onHandle: () => {
      patch.execute([{ set: { editorialStage: 'approved', reviewerName: currentUser.name || currentUser.email, approvedAt: new Date().toISOString() } }])
      props.onComplete()
    },
  }
}

export const ReturnToWritingAction: DocumentActionComponent = props => {
  const currentUser = useCurrentUser()
  const { patch } = useDocumentOperation(props.id, props.type)
  const stage = stageOf(props.draft || props.published)
  if (!currentUser || !hasApprovalRole(currentUser.roles) || stage === 'writing') return null

  return {
    label: '退回修改',
    icon: ResetIcon,
    tone: 'caution',
    disabled: Boolean(patch.disabled),
    onHandle: () => {
      patch.execute([{ set: { editorialStage: 'writing', status: 'draft' } }, { unset: ['reviewerName', 'approvedAt'] }])
      props.onComplete()
    },
  }
}
