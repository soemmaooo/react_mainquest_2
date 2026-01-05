import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';

const { VITE_APP_API_BASE, VITE_APP_API_PATH } = import.meta.env;

function App() {
  const modalRef = useRef(null);
  const productModal = useRef(null);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${VITE_APP_API_BASE}/admin/signin`,
        formData
      );
      const { token, expired } = res.data;
      document.cookie = `hextoken=${token}; expires=${new Date(
        expired
      )}; path=/;`;
      axios.defaults.headers.common['Authorization'] = token;
      setIsAuth(true);
      getProducts();
    } catch (error) {
      alert('登入失敗');
      console.error(error);
    }
  };

  const checkLogin = async () => {
    try {
      await axios.post(`${VITE_APP_API_BASE}/api/user/check`);
      setIsAuth(true);
      getProducts();
    } catch (error) {
      document.cookie =
        'hextoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      setIsAuth(false);
      console.log('驗證失效，請重新登入');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${VITE_APP_API_BASE}/logout`);
      document.cookie =
        'hextoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      delete axios.defaults.headers.common['Authorization'];
      alert('登出成功');
      setIsAuth(false);
    } catch (error) {
      console.error('登出失敗:', error);
      alert('登出失敗');
    }
  };

  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('hextoken='))
      ?.split('=')[1];

    if (token) {
      axios.defaults.headers.common['Authorization'] = token;
      setIsAuth(true);
      getProducts();
    }
  }, []);

  const handleInputChange = (e) => {
    const { value, name } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const getProducts = async () => {
    try {
      const res = await axios.get(
        `${VITE_APP_API_BASE}/api/${VITE_APP_API_PATH}/products/all`
      );
      console.log(res.data.products);
      setProducts(res.data.products);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isAuth && modalRef.current) {
      productModal.current = new bootstrap.Modal(modalRef.current);
    }
  }, [isAuth]);

  const openProductModal = (item) => {
    setTempProduct(item);
    productModal.current.show();
  };

  return (
    <>
      {isAuth ? (
        <div className="container mt-5">
          <div className="primary-border rounded-5 p-5">
            <h2 className="text-center h1 mb-4">產品列表</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>產品名稱</th>
                  <th>原價</th>
                  <th>售價</th>
                  <th>是否啟用</th>
                  <th>查看細節</th>
                </tr>
              </thead>
              <tbody>
                {products && products.length > 0 ? (
                  products.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{item.origin_price}</td>
                      <td>{item.price}</td>
                      <td>{item.is_enabled ? '啟用' : '未啟用'}</td>
                      <td>
                        <button
                          className="btn primary-bg"
                          onClick={() => openProductModal(item)}
                          data-bs-toggle="modal"
                          data-bs-target="#productModal"
                        >
                          查看細節
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">尚無產品資料</td>
                  </tr>
                )}
              </tbody>
            </table>
            <button
              type="button"
              className="btn primary-bg"
              onClick={handleLogout}
            >
              登出
            </button>
          </div>

          <div
            className="modal fade"
            id="productModal"
            tabIndex="-1"
            aria-labelledby="productModal"
            aria-hidden="true"
            ref={modalRef}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                {tempProduct && (
                  <div className="card py-3">
                    <img
                      src={tempProduct.imageUrl}
                      className="card-img-top primary-image"
                      alt="主圖"
                    />
                    <div className="card-body">
                      <h5 className="card-title h3">{tempProduct.title}</h5>
                      <p className="card-text">
                        商品描述：{tempProduct.description}
                      </p>
                      <p className="card-text">商品內容：</p>
                      {tempProduct.content}

                      <p className="h5 my-3">
                        <del className="card-text text-secondary">
                          {tempProduct.origin_price}元
                        </del>
                        <span className="ms-2">/ {tempProduct.price} 元</span>
                      </p>

                      <h5 className="mt-3">更多圖片：</h5>
                      <div className="d-flex flex-wrap">
                        {tempProduct.imagesUrl?.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            style={{ width: '100px' }}
                            className="me-2 mb-2"
                            alt="小圖"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        data-bs-dismiss="modal"
                      >
                        關閉
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mt-5 d-flex flex-column align-items-center">
          <div className="row justify-content-center">
            <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>
            <div className="col-8">
              <form id="form" className="" onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    name="username"
                    id="username"
                    placeholder="name@example.com"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    autoFocus
                  />
                  <label htmlFor="username">Email address</label>
                </div>
                <div className="form-floating">
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    id="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="password">Password</label>
                </div>
                <button
                  className="btn btn-lg primary-bg w-100 mt-3"
                  type="submit"
                >
                  登入
                </button>
              </form>
            </div>
          </div>
          <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
        </div>
      )}
    </>
  );
}

export default App;
