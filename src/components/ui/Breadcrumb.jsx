import React from 'react';
import Icon from '../AppIcon';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ items = [] }) => {
  if (!items || items?.length === 0) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      {items?.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
          )}
          {item?.href && index < items?.length - 1 ? (
            <Link
              to={item?.href}
              className="hover:text-foreground transition-colors duration-150"
            >
              {item?.label}
            </Link>
          ) : (
            <span className={index === items?.length - 1 ? 'text-foreground font-medium' : ''}>
              {item?.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;