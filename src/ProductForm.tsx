import React, { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface ProductFormValues {
  sku: string;
  name: string;
  price: string;
  images: File[];
}

interface ProductFormErrors {
  sku?: string;
  name?: string;
  price?: string;
  images?: string;
}

const ProductForm: React.FC = () => {
  const [form, setForm] = useState<ProductFormValues>({
    sku: '',
    name: '',
    price: '',
    images: [],
  });
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetch(`/api/products/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch product');
          return res.json();
        })
        .then(data => {
          setForm({
            sku: data.sku,
            name: data.name,
            price: String(data.price),
            images: [], // Images will be handled as URLs for preview
          });
          setImagePreviews(data.images || []);
        })
        .catch(err => setApiError((err as Error).message))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const validate = (): ProductFormErrors => {
    const newErrors: ProductFormErrors = {};
    if (!form.sku) newErrors.sku = 'SKU is required';
    if (!form.name) newErrors.name = 'Name is required';
    if (!form.price) newErrors.price = 'Price is required';
    else if (isNaN(Number(form.price)) || Number(form.price) <= 0) newErrors.price = 'Price must be a positive number';
    if (!id && form.images.length === 0) newErrors.images = 'At least one image is required';
    return newErrors;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setForm((prev) => ({ ...prev, images: files }));
      setImagePreviews(files.map((file) => URL.createObjectURL(file)));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        // For now, just send image URLs as strings (no upload)
        const payload = {
          sku: form.sku,
          name: form.name,
          price: Number(form.price),
          images: imagePreviews, // In real app, handle file upload
        };
        let res;
        if (id) {
          res = await fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } else {
          res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        }
        if (!res.ok) throw new Error('Failed to save product');
        navigate('/products', { replace: true });
      } catch (err) {
        setApiError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="product-form-container">
      <form className="product-form" onSubmit={handleSubmit}>
        <h2>{id ? 'Edit' : 'Add'} Product</h2>
        {apiError && <p style={{ color: 'red' }}>{apiError}</p>}
        <div className="form-group">
          <label htmlFor="sku">SKU</label>
          <input
            type="text"
            id="sku"
            name="sku"
            value={form.sku}
            onChange={handleChange}
            className={errors.sku ? 'error' : ''}
            autoComplete="off"
            disabled={loading}
          />
          {errors.sku && <span className="error-message">{errors.sku}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
            autoComplete="off"
            disabled={loading}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            type="number"
            id="price"
            name="price"
            value={form.price}
            onChange={handleChange}
            className={errors.price ? 'error' : ''}
            min="0"
            step="0.01"
            autoComplete="off"
            disabled={loading}
          />
          {errors.price && <span className="error-message">{errors.price}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="images">Images</label>
          <input
            type="file"
            id="images"
            name="images"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className={errors.images ? 'error' : ''}
            disabled={loading}
          />
          {errors.images && <span className="error-message">{errors.images}</span>}
          <div className="image-previews">
            {imagePreviews.map((src, idx) => (
              <img key={idx} src={src} alt={`preview-${idx}`} className="image-preview" />
            ))}
          </div>
        </div>
        <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Saving...' : 'Submit'}</button>
      </form>
    </div>
  );
};

export default ProductForm; 