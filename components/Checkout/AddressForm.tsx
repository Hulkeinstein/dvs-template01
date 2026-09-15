import React from 'react';

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  email: string;
  phone: string;
  sameAsShipping?: boolean;
}

interface AddressFormProps {
  mode: 'shipping' | 'billing';
  data: ShippingAddress;
  onChange: (field: string, value: string) => void;
  disabled?: boolean;
  errors?: Record<string, string>;
}

const AddressForm: React.FC<AddressFormProps> = ({
  mode,
  data,
  onChange,
  disabled = false,
  errors = {},
}) => {
  const title = mode === 'shipping' ? 'Shipping Address' : 'Billing Address';
  const isDisabled = disabled || (mode === 'billing' && data.sameAsShipping);

  return (
    <>
      <h4 className="checkout-title">{title}</h4>

      {mode === 'billing' && (
        <div className="mb-4">
          <input
            type="checkbox"
            id="sameAsShipping"
            checked={data.sameAsShipping}
            onChange={(e) =>
              onChange('sameAsShipping', e.target.checked.toString())
            }
          />
          <label htmlFor="sameAsShipping" className="ms-2">
            Same as shipping address
          </label>
        </div>
      )}

      <div className="row">
        <div className="col-lg-6 col-12 mb--30">
          <input
            type="text"
            placeholder="First Name*"
            value={data.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            disabled={isDisabled}
            className={errors.firstName ? 'error' : ''}
            required
          />
          {errors.firstName && (
            <span className="error-message">{errors.firstName}</span>
          )}
        </div>

        <div className="col-lg-6 col-12 mb--30">
          <input
            type="text"
            placeholder="Last Name*"
            value={data.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            disabled={isDisabled}
            className={errors.lastName ? 'error' : ''}
            required
          />
          {errors.lastName && (
            <span className="error-message">{errors.lastName}</span>
          )}
        </div>

        <div className="col-12 mb--30">
          <input
            type="text"
            placeholder="Street Address*"
            value={data.address}
            onChange={(e) => onChange('address', e.target.value)}
            disabled={isDisabled}
            className={errors.address ? 'error' : ''}
            required
          />
          {errors.address && (
            <span className="error-message">{errors.address}</span>
          )}
        </div>

        <div className="col-lg-6 col-12 mb--30">
          <input
            type="text"
            placeholder="City*"
            value={data.city}
            onChange={(e) => onChange('city', e.target.value)}
            disabled={isDisabled}
            className={errors.city ? 'error' : ''}
            required
          />
          {errors.city && <span className="error-message">{errors.city}</span>}
        </div>

        <div className="col-lg-6 col-12 mb--30">
          <input
            type="text"
            placeholder="State/Province*"
            value={data.state}
            onChange={(e) => onChange('state', e.target.value)}
            disabled={isDisabled}
            className={errors.state ? 'error' : ''}
            required
          />
          {errors.state && (
            <span className="error-message">{errors.state}</span>
          )}
        </div>

        <div className="col-lg-6 col-12 mb--30">
          <input
            type="text"
            placeholder="ZIP/Postal Code*"
            value={data.zipCode}
            onChange={(e) => onChange('zipCode', e.target.value)}
            disabled={isDisabled}
            className={errors.zipCode ? 'error' : ''}
            required
          />
          {errors.zipCode && (
            <span className="error-message">{errors.zipCode}</span>
          )}
        </div>

        <div className="col-lg-6 col-12 mb--30">
          <input
            type="text"
            placeholder="Country*"
            value={data.country}
            onChange={(e) => onChange('country', e.target.value)}
            disabled={isDisabled}
            className={errors.country ? 'error' : ''}
            required
          />
          {errors.country && (
            <span className="error-message">{errors.country}</span>
          )}
        </div>

        {mode === 'shipping' && (
          <>
            <div className="col-12 mb--30">
              <input
                type="email"
                placeholder="Email Address*"
                value={data.email}
                onChange={(e) => onChange('email', e.target.value)}
                disabled={isDisabled}
                className={errors.email ? 'error' : ''}
                required
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="col-12 mb--30">
              <input
                type="tel"
                placeholder="Phone Number*"
                value={data.phone}
                onChange={(e) => onChange('phone', e.target.value)}
                disabled={isDisabled}
                className={errors.phone ? 'error' : ''}
                required
              />
              {errors.phone && (
                <span className="error-message">{errors.phone}</span>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AddressForm;
