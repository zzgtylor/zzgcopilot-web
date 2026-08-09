import type { DefaultDocumentNodeResolver, StructureResolver } from 'sanity/structure'
import { ContentPreview } from './components/ContentPreview'

const postList = (S: Parameters<StructureResolver>[0], id: string, title: string, filter: string) => S.listItem()
  .id(id)
  .title(title)
  .child(S.documentList().id(`${id}-documents`).title(title).schemaType('post').filter(filter))

export const structure: StructureResolver = (S) => S.list()
  .id('content-management')
  .title('内容管理')
  .items([
    postList(S, 'all-posts', '全部文章', '_type == "post"'),
    postList(S, 'writing-posts', '撰写中', '_type == "post" && (!defined(editorialStage) || editorialStage == "writing")'),
    postList(S, 'review-posts', '待审核', '_type == "post" && editorialStage == "review"'),
    postList(S, 'approved-posts', '已批准', '_type == "post" && editorialStage == "approved"'),
    postList(S, 'scheduled-posts', '计划发布', '_type == "post" && status == "scheduled" && dateTime(publishedAt) > dateTime(now())'),
    postList(S, 'published-posts', '已发布', '_type == "post" && (status == "published" || (status == "scheduled" && dateTime(publishedAt) <= dateTime(now()))) && (!defined(expiresAt) || dateTime(expiresAt) > dateTime(now()))'),
    postList(S, 'expired-posts', '已过期', '_type == "post" && defined(expiresAt) && dateTime(expiresAt) <= dateTime(now())'),
    S.divider(),
    S.documentTypeListItem('page').title('独立页面'),
    S.documentTypeListItem('category').title('分类'),
    S.documentTypeListItem('navigationItem').title('导航菜单'),
    S.listItem().id('site-settings').title('站点与首页设置').child(
      S.document().id('site-settings-editor').schemaType('siteSettings').documentId('site-settings').title('站点与首页设置'),
    ),
  ])

export const defaultDocumentNode: DefaultDocumentNodeResolver = (S, { schemaType }) => {
  if (schemaType === 'post' || schemaType === 'page') {
    return S.document().views([
      S.view.form().id('editor').title('编辑'),
      S.view.component(ContentPreview).id('preview').title('实时预览'),
    ])
  }
  return S.document().views([S.view.form()])
}
