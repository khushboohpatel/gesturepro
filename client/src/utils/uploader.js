'use client';

import React from 'react';

// Placeholder for file uploader component
const Uploader = ({ formik, name, icon, titleText, innerText, folder, multiple, accept }) => {
  return (
    <div className="file-uploader">
      <div className="file-uploader-area">
        {icon && <div className="file-uploader-icon">{icon}</div>}
        {titleText && <h4 className="file-uploader-title">{titleText}</h4>}
        {innerText && <p className="file-uploader-text">{innerText}</p>}
        <input 
          type="file" 
          name={name}
          multiple={multiple}
          accept={accept}
          onChange={(e) => {
            // When files are selected, update formik
            if (e.target.files && e.target.files.length > 0) {
              formik.setFieldValue(name, e.target.files);
            }
          }}
          style={{ display: 'none' }}
          id={`file-upload-${name}`}
        />
        <label htmlFor={`file-upload-${name}`} className="file-upload-button">
          Choose File
        </label>
      </div>
      
      {formik.errors[name] && formik.touched[name] && (
        <div className="file-upload-error">{formik.errors[name]}</div>
      )}
    </div>
  );
};

export default Uploader; 