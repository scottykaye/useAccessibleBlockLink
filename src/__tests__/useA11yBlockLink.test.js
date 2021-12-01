import React, {useRef} from 'react';
import {render, configure, fireEvent} from '@testing-library/react';
import useA11yBlockLink from '../';

configure({testIdAttribute: 'data-test-id'});

const AnchorDemo = ({testId, handleMainClick, handleThirdClick}) => {
  const mainClickRef = useRef();

  const {handleClick: handleA11yClick} = useA11yBlockLink(mainClickRef);

  const handleClick = (e) => {
    handleMainClick(e);
    handleA11yClick(e);
  };

  return (
    <div onClick={handleClick} data-test-id={`${testId}-wrapper`}>
      <a ref={mainClickRef} data-test-id={`${testId}-main`} href="#main">
        <img
          data-test-id={`${testId}-image`}
          src="https://dummyimage.com/300x300/000/fff"
        />
      </a>
      <a href="#second" data-test-id={`${testId}-second`}>
        Change Page
      </a>
      <p>Description text</p>
      <button
        type="button"
        onClick={() => {
          handleThirdClick();
          location.assign('#third');
        }}
        data-test-id={`${testId}-third`}
      >
        Third Event
      </button>
    </div>
  );
};

const ButtonDemo = ({testId, handleMainClick, handleThirdClick}) => {
  const mainClickRef = useRef();

  const {handleClick: handleA11yClick} = useA11yBlockLink(mainClickRef);

  return (
    <div onClick={handleA11yClick} data-test-id={`${testId}-wrapper`}>
      <button
        ref={mainClickRef}
        data-test-id={`${testId}-main`}
        onClick={handleMainClick}
      >
        <img
          data-test-id={`${testId}-image`}
          src="https://dummyimage.com/300x300/000/fff"
        />
      </button>
      <a href="#second" data-test-id={`${testId}-second`}>
        Change Page
      </a>
      <p>Description text</p>
      <button
        type="button"
        onClick={handleThirdClick}
        data-test-id={`${testId}-third`}
      >
        Third Event
      </button>
    </div>
  );
};

describe('useA11yBlockLink', () => {
  let prevLocation;
  beforeEach(() => {
    // Cache the global.location property as the previous location value
    prevLocation = global.location;
    // Edit the global window objects location property
    Object.defineProperty(global, 'location', {
      value: {
        // Add the current location as the value
        ...global.location,
        // Add the assign function to help us determine the href has changed
        assign(href) {
          this.href = href;
        },
      },
      writable: true,
    });
  });

  afterEach(() => {
    // Update to the previous location after each test
    Object.defineProperty(global, 'location', {
      value: prevLocation,
      writable: true,
    });
  });

  it('fires main click on when clicking the wrapping element', () => {
    const mainClickMock = jest.fn();
    const thirdClickMock = jest.fn();

    const {queryByTestId} = render(
      <AnchorDemo
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
    // Expect that firing the event will update the URL once manually updated
    expect(global.location.href.includes('#main')).toBe(true);
  });

  it('fires main click when you click other non-interactive element within the card', () => {
    const mainClickMock = jest.fn();

    const {queryByTestId} = render(
      <AnchorDemo testId="demo" handleMainClick={mainClickMock} />
    );

    // Fire an event specifically on the anchor tag
    fireEvent.click(queryByTestId('demo-image'));

    // Expect the wrapper click to fire
    expect(mainClickMock).toHaveBeenCalledTimes(1);

    // Expect the href to match the href we want to be provided
    expect(global.location.href.includes('#main')).toBe(true);
  });

  it("doesn't trigger main click when interacting with nested anchor link", () => {
    const mainClickMock = jest.fn();

    const {queryByTestId} = render(
      <AnchorDemo handleMainClick={mainClickMock} testId="demo" />
    );

    // Fire an event specifically on the second anchor tag
    fireEvent.click(queryByTestId('demo-second'));
    // Manually fire the location.assign to simulate the value of event above from the native anchor tag element
    location.assign(queryByTestId('demo-second').getAttribute('href'));
    // Now expect the href to be the secondary click
    expect(global.location.href.includes('#second')).toBe(true);
  });

  it('successfully fires correct values for either the main or the secondary links', () => {
    const mainClickMock = jest.fn();

    const {queryByTestId} = render(
      <AnchorDemo handleMainClick={mainClickMock} testId="demo" />
    );

    // Fire an event specifically on the second anchor tag
    fireEvent.click(queryByTestId('demo-second'));
    // Manually fire the location.assign to simulate the value of event above from the native anchor tag element
    location.assign(queryByTestId('demo-second').getAttribute('href'));
    // Now expect the href to be the secondary click
    expect(global.location.href.includes('#second')).toBe(true);

    // Fire an event on the containing element to confirm both links work
    fireEvent.click(queryByTestId('demo-wrapper'));
    // Expect the href to match the href we want to be provided
    expect(global.location.href.includes('#main')).toBe(true);
  });

  it('fires the internal button event when clicking the third button', () => {
    const mainClickMock = jest.fn();
    const thirdClickMock = jest.fn();

    const {queryByTestId} = render(
      <AnchorDemo
        testId="demo"
        handleMainClick={mainClickMock}
        handleThirdClick={thirdClickMock}
      />
    );

    fireEvent.click(queryByTestId('demo-third'));

    // Still expect a main click was fired since we hit the entire div onClick handler
    expect(mainClickMock).toHaveBeenCalledTimes(1);

    // Expect the internal button was not clicked
    expect(thirdClickMock).toHaveBeenCalledTimes(1);

    // Expect that firing the event will update the URL once manually updated
    expect(global.location.href.includes('#third')).toBe(true);
  });
});
