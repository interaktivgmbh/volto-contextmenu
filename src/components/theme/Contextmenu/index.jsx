import React, { useEffect, useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import { defineMessages, useIntl } from 'react-intl';
import { getContextMenu } from '@interaktiv.de/volto-contextmenu/actions';
import { flattenToAppURL, getBaseUrl } from '@plone/volto/helpers';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';

const messages = defineMessages({
  toggle: {
    id: 'contextMenuToggle',
    defaultMessage: 'Toggle context menu',
  },
  open: {
    id: 'contextMenuOpen',
    defaultMessage: 'Open context menu',
  },
  close: {
    id: 'contextMenuClose',
    defaultMessage: 'Close context menu',
  },
  skipLink: {
    id: 'contextMenuSkipLink',
    defaultMessage: 'Skip context menu',
  },
  back: {
    id: 'contextMenuBack',
    defaultMessage: 'Back',
  },
  scrollUp: {
    id: 'contextMenuScrollUp',
    defaultMessage: 'More items above',
  },
  scrollDown: {
    id: 'contextMenuScrollDown',
    defaultMessage: 'More items below',
  },
});

const ContextMenuItem = ({ item }) => {
  const url = flattenToAppURL(item.url);

  return (
    <li className={cx('context-menu-item', { active: item.is_active })}>
      <Link
        to={url}
        aria-current={item.is_active ? 'page' : undefined}
      >
        {item.title}
      </Link>
      {item.children && item.children.length > 0 && (
        <ul className="context-menu-children">
          {item.children.map((child) => (
            <ContextMenuItem key={child.uid} item={child} />
          ))}
        </ul>
      )}
    </li>
  );
};

/**
 * ContextMenu component - displays a context navigation based on current location
 *
 * @param {string} className - Additional CSS class for custom styling/positioning
 * @param {string} ariaLabel - Accessible label for the navigation
 * @param {function} renderHeader - Optional render prop for custom header (e.g., back button, title)
 * @param {function} renderFooter - Optional render prop for custom footer
 * @param {boolean} defaultOpen - Initial open state (uncontrolled mode)
 * @param {boolean} isOpen - Controlled visibility state
 * @param {function} onToggle - Callback when toggle button is clicked
 * @param {boolean} showToggle - Whether to show the toggle button
 * @param {function} renderToggle - Optional custom render for toggle button
 * @param {string} skipLinkTarget - ID of element to skip to (e.g., 'main', 'content')
 * @param {boolean} showBackButton - Whether to show the back button
 */
const ContextMenu = ({
  className,
  ariaLabel = 'Context navigation',
  renderHeader,
  renderFooter,
  defaultOpen = true,
  isOpen: controlledIsOpen,
  onToggle,
  showToggle = false,
  renderToggle,
  skipLinkTarget,
  showBackButton = false,
}) => {
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const intl = useIntl();

  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const pathname = flattenToAppURL(getBaseUrl(location.pathname));
  const { items, loaded, loading } = useSelector((state) => state?.contextMenu) || {};

  useEffect(() => {
    dispatch(getContextMenu(pathname));
  }, [dispatch, pathname]);

  const itemsRef = useRef(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const updateScrollIndicators = useCallback(() => {
    const el = itemsRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    setCanScrollUp(scrollTop > 0);
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 1);
  }, []);

  useEffect(() => {
    const el = itemsRef.current;
    if (!el) return;

    updateScrollIndicators();

    el.addEventListener('scroll', updateScrollIndicators);

    const resizeObserver = new ResizeObserver(updateScrollIndicators);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', updateScrollIndicators);
      resizeObserver.disconnect();
    };
  }, [updateScrollIndicators, isOpen, items]);

  const handleToggle = () => {
    if (!isControlled) {
      setInternalIsOpen(!internalIsOpen);
    }
    onToggle?.(!isOpen);
  };

  const handleBack = () => {
    history.goBack();
  };

  const toggleButton = showToggle && (
    renderToggle ? (
      renderToggle({ isOpen, onToggle: handleToggle })
    ) : (
      <button
        className="context-menu-toggle"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-label={intl.formatMessage(isOpen ? messages.close : messages.open)}
        title={intl.formatMessage(isOpen ? messages.close : messages.open)}
        type="button"
      >
        {isOpen ? '\u2715' : '\u2630'}
      </button>
    )
  );

  if (loading || !loaded || !items || items.length === 0) {
    return null;
  }

  return (
    <div className={cx('context-menu-wrapper', { 'is-open': isOpen }, className)}>
      {toggleButton}
      {isOpen && (
        <nav className="context-menu" aria-label={ariaLabel}>
          {skipLinkTarget && (
            <a
              href={`#${skipLinkTarget}`}
              className="context-menu-skip-link"
            >
              {intl.formatMessage(messages.skipLink)}
            </a>
          )}
          {(showBackButton || renderHeader) && (
            <div className="context-menu-header">
              {showBackButton && (
                <button
                  type="button"
                  className="context-menu-back"
                  onClick={handleBack}
                >
                  {intl.formatMessage(messages.back)}
                </button>
              )}
              {renderHeader?.()}
            </div>
          )}
          <div className="context-menu-items-wrapper">
            {canScrollUp && (
              <div
                className="context-menu-scroll-indicator scroll-up"
                aria-hidden="true"
                title={intl.formatMessage(messages.scrollUp)}
              >
                <span className="scroll-arrow">&#9650;</span>
              </div>
            )}
            <ul className="context-menu-items" role="list" ref={itemsRef}>
              {items.map((item) => (
                <ContextMenuItem key={item.uid} item={item} />
              ))}
            </ul>
            {canScrollDown && (
              <div
                className="context-menu-scroll-indicator scroll-down"
                aria-hidden="true"
                title={intl.formatMessage(messages.scrollDown)}
              >
                <span className="scroll-arrow">&#9660;</span>
              </div>
            )}
          </div>
          {renderFooter && (
            <div className="context-menu-footer">{renderFooter()}</div>
          )}
        </nav>
      )}
    </div>
  );
};

ContextMenu.propTypes = {
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
  renderHeader: PropTypes.func,
  renderFooter: PropTypes.func,
  defaultOpen: PropTypes.bool,
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func,
  showToggle: PropTypes.bool,
  renderToggle: PropTypes.func,
  skipLinkTarget: PropTypes.string,
  showBackButton: PropTypes.bool,
};

export default ContextMenu;
