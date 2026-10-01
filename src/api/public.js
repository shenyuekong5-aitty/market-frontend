import request from '@/utils/request'

// 公开、只读：仅返回营业集市里已上架的商品。
export function getPublicProducts(page = 1, size = 24) {
  return request.get('/public/products', { params: { page, size }, skipAuth: true })
}
