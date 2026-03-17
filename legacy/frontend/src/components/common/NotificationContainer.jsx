import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaTimes, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { removeNotification } from '../../store/slices/uiSlice';
import './NotificationContainer.css';

const NotificationContainer = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(state => state.ui.notifications);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle />;
      case 'error':
        return <FaExclamationTriangle />;
      case 'warning':
        return <FaExclamationTriangle />;
      case 'info':
      default:
        return <FaInfoCircle />;
    }
  };

  const handleClose = (id) => {
    dispatch(removeNotification(id));
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
          onClick={() => handleClose(notification.id)}
        >
          <div className="notification-icon">
            {getIcon(notification.type)}
          </div>

          <div className="notification-content">
            <div className="notification-title">
              {notification.title || notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
            </div>
            <div className="notification-message">
              {notification.message}
            </div>
          </div>

          <button
            className="notification-close"
            onClick={(e) => {
              e.stopPropagation();
              handleClose(notification.id);
            }}
          >
            <FaTimes />
          </button>

          {/* Progress bar for auto-dismiss */}
          {notification.duration && (
            <div
              className="notification-progress"
              style={{ animationDuration: `${notification.duration}ms` }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;