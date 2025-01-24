import React from 'react';
import PropTypes from 'prop-types';
import './AdminMain.css';

const AdminMain = ({ collapsed = false, children }) => {
  return (
    <div className={`admin-main ${collapsed ? 'collapsed' : ''}`}>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

AdminMain.propTypes = {
  collapsed: PropTypes.bool,
  children: PropTypes.node,
};

export default AdminMain;
