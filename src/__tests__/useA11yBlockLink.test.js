import React, {useRef} from 'react';
import {render, configure, fireEvent} from '@testing-library/react';
import useA11yBlockLink from '../useA11yBlockLink';

configure({testIdAttribute: 'data-test-id'});

const Demo = ({testId, handleMainClick, handleThirdClick}) => {
  const mainClickRef = useRef();
  const secondRef = useRef();
  const thirdRef = useRef();

  const {handleClick: handleA11yClick} = useA11yBlockLink({
    mainClick: mainClickRef,
    secondRef,
    thirdRef,
  });

  const handleClick = () => {
    handleMainClick();
    handleA11yClick();
  };

  return (
    <div onClick={handleMainClick} data-test-id={`${testId}-wrapper`}>
      <a is="a" ref={mainClickRef} data-test-id={`${testId}-main`} href="#main">
        <img
          data-test-id={`${testId}-image`}
          src="https://dummyimage.com/300x300/000/fff"
        />
      </a>
      <a href="#second" ref={secondRef} data-test-id={`${testId}-second`}>
        Change Page
      </a>
      <p>Description text</p>
      <button
        type="button"
        onClick={handleThirdClick}
        ref={thirdRef}
        data-test-id={`${testId}-third`}
      >
        Third Event
      </button>
    </div>
  );
};

describe('useA11yBlockLink', () => {
  global.window = Object.create(window);
  const defineUrl = (url) => {
    Object.defineProperty(window, 'location', {
      value: {
        href: url,
      },
      writable: true,
    });
  };

  it('fires main click on containing div', () => {
    const mainClickMock = jest.fn();
    const thirdClickMock = jest.fn();
    const {container, queryByTestId} = render(
      <Demo
        testId="demo"
        handleMainClick={mainClickMock}
        handleThirdClick={thirdClickMock}
      />
    );

    fireEvent.click(queryByTestId('demo-wrapper'));

    // Expect click event to fire once
    expect(mainClickMock).toHaveBeenCalledTimes(1);
    // Expect the internal button was not clicked
    expect(thirdClickMock).toHaveBeenCalledTimes(0);

    // Manually update URL after click to window with the href
    defineUrl(queryByTestId('demo-main').getAttribute('href'));

    // Expect that firing the event will update the URL once manually updated
    expect(window.location.href).toBe('#main');
  });

  it('fires main click when you click other non-interactive element within the card', () => {
    const mainClickMock = jest.fn();
    const {queryByTestId} = render(
      <Demo testId="demo" handleMainClick={mainClickMock} />
    );

    // Fire an event specifically on the anchor tag
    fireEvent.click(queryByTestId('demo-image'));

    // Expect the wrapper click to fire
    expect(mainClickMock).toHaveBeenCalledTimes(1);

    // Expect the href to match the href we want to be provided
    expect(queryByTestId('demo-main').getAttribute('href')).toBe('#main');

    // Manually update URL after click to window with the href
    defineUrl(queryByTestId('demo-main').getAttribute('href'));

    // Expect that firing the event will update the URL once manually updated
    expect(window.location.href).toBe('#main');
  });

  it('updates the URL when clicking the anchor link secondary link', () => {
    const {queryByTestId} = render(<Demo testId="demo" />);

    // Fire an event specifically on the anchor tag
    fireEvent.click(queryByTestId('demo-second'));

    // Expect the href to match the href we want to be provided
    expect(queryByTestId('demo-second').getAttribute('href')).toBe('#second');

    // Manually update URL after click to window with the href
    defineUrl(queryByTestId('demo-second').getAttribute('href'));

    // Expect that firing the event will update the URL once manually updated
    expect(window.location.href).toBe('#second');
  });

  it('fires the internal button event when clicking the third button', () => {
    const mainClickMock = jest.fn();
    const thirdClickMock = jest.fn();
    const {container, queryByTestId} = render(
      <Demo
        testId="demo"
        handleMainClick={mainClickMock}
        handleThirdClick={() => {
          thirdClickMock();
          defineUrl('#third');
        }}
      />
    );

    fireEvent.click(queryByTestId('demo-third'));

    // Still expect a main click was fired
    expect(mainClickMock).toHaveBeenCalledTimes(1);
    // Expect the internal button was not clicked
    expect(thirdClickMock).toHaveBeenCalledTimes(1);
    // Expect that firing the event will update the URL once manually updated
    expect(window.location.href).toBe('#third');
  });
});
