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
      <a
        // Sets a reference to what we want the main click to be
        ref={mainClickRef}
        data-test-id={`${testId}-main`}
        href="#main"
      >
        <img data-test-id={`${testId}-image`} src="#" />
      </a>
      <a href="#second" data-test-id={`${testId}-second`}>
        Change Page
      </a>
      <p data-test-id={`${testId}-description`}>Description text</p>
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

const ButtonDemo = ({
  testId,
  handleMainClick,
  handleThirdClick,
  handleWrapperClick,
}) => {
  const mainClickRef = useRef();

  const {handleClick: handleA11yClick} = useA11yBlockLink(mainClickRef);

  // We do not need handleA11yClick here in a button main click instance
  // The `handleA11yClick` from our hook will invoke the references onClick handler for us if a click is provided on the element we provide a ref to.
  const handleClick = (e) => {
    handleWrapperClick(e);
    handleA11yClick(e);
  };

  return (
    <div onClick={handleClick} data-test-id={`${testId}-wrapper`}>
      <button
        // Sets a reference to what we want the main click to be
        ref={mainClickRef}
        data-test-id={`${testId}-main`}
        onClick={(e) => {
          handleMainClick(e);
          location.assign('main');
        }}
      >
        <img data-test-id={`${testId}-image`} src="#" />
      </button>
      <a href="#second" data-test-id={`${testId}-second`}>
        Change Page
      </a>
      <p data-test-id={`${testId}-description`}>Description text</p>
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

  describe('Anchor Link Demos', () => {
    it('fires main click when clicking the wrapping element', () => {
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

      // Expect the href to match the href we fired
      expect(global.location.href.includes('#main')).toBe(true);
    });

    it('fires main click when you click other non-interactive nested button elements within the card', () => {
      const mainClickMock = jest.fn();

      const {queryByTestId} = render(
        <AnchorDemo testId="demo" handleMainClick={mainClickMock} />
      );

      // Fire an event specifically on the anchor tag
      fireEvent.click(queryByTestId('demo-image'));

      // Expect the wrapper click to fire
      expect(mainClickMock).toHaveBeenCalledTimes(1);

      // Expect the href to match the href we fired
      expect(global.location.href.includes('#main')).toBe(true);
    });

    it('fires main click when you click other non-interactive element within the card', () => {
      const mainClickMock = jest.fn();

      const {queryByTestId} = render(
        <AnchorDemo testId="demo" handleMainClick={mainClickMock} />
      );

      // Fire an event specifically on the anchor tag
      fireEvent.click(queryByTestId('demo-description'));

      // Expect the wrapper click to fire
      expect(mainClickMock).toHaveBeenCalledTimes(1);

      // Expect the href to matches the href we fired
      expect(global.location.href.includes('#main')).toBe(true);
    });

    it("doesn't trigger main click when interacting with nested anchor link", () => {
      const mainClickMock = jest.fn();

      const {queryByTestId} = render(
        <AnchorDemo handleMainClick={mainClickMock} testId="demo" />
      );

      // Fire an event specifically on the second anchor tag
      fireEvent.click(queryByTestId('demo-second'));

      // Sanity check that main isn't fired before our manual update of the native anchor link
      expect(global.location.href.includes('#main')).toBe(false);

      // Manually fire the location.assign to simulate the value of event above from the native anchor tag element
      location.assign(queryByTestId('demo-second').getAttribute('href'));

      // Expect the href to be the native href we have assigned
      expect(global.location.href.includes('#second')).toBe(true);
    });

    it('successfully fires correct values for either the main or the secondary links', () => {
      const mainClickMock = jest.fn();

      const {queryByTestId} = render(
        <AnchorDemo handleMainClick={mainClickMock} testId="demo" />
      );

      // Fire an event specifically on the second anchor tag
      fireEvent.click(queryByTestId('demo-second'));

      // Sanity check that main fallback isn't fired before our manual update of the native anchor link
      expect(global.location.href.includes('#main')).toBe(false);

      // Manually fire the location.assign to simulate the value of the event above from the native anchor tag element
      location.assign(queryByTestId('demo-second').getAttribute('href'));

      // Expect the href to be the native href we have assigned
      expect(global.location.href.includes('#second')).toBe(true);

      // Fire an event on the containing element to confirm both links work
      fireEvent.click(queryByTestId('demo-wrapper'));

      // Expect the href to match the href we fired
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

      // Expect a main click was fired since we hit the onClick handler
      expect(mainClickMock).toHaveBeenCalledTimes(1);

      // Expect the internal button was clicked
      expect(thirdClickMock).toHaveBeenCalledTimes(1);

      // Expect that firing the event will update the URL what was fired
      expect(global.location.href.includes('#third')).toBe(true);
    });
  });

  describe('Button Demos', () => {
    it('fires main click when clicking the wrapping element', () => {
      const mainClickMock = jest.fn();
      const thirdClickMock = jest.fn();
      const wrapperClickMock = jest.fn();

      const {queryByTestId} = render(
        <ButtonDemo
          testId="demo"
          handleMainClick={mainClickMock}
          handleThirdClick={thirdClickMock}
          handleWrapperClick={wrapperClickMock}
        />
      );

      fireEvent.click(queryByTestId('demo-wrapper'));

      // Expect the wrapper click to fire twice
      // Wrapper fires once when clicking the entire container
      // Wrapper fires a second time when handleA11yClick is invoked for the fallback of the ref
      expect(wrapperClickMock).toHaveBeenCalledTimes(2);

      // Expect click event to fire once when when invoked
      expect(mainClickMock).toHaveBeenCalledTimes(1);

      // Expect the internal button was not clicked
      expect(thirdClickMock).toHaveBeenCalledTimes(0);

      // Expect the href to match the location we assigned
      expect(global.location.href.includes('main')).toBe(true);
    });

    it('fires main click when you click other non-interactive nested button elements within the card', () => {
      const mainClickMock = jest.fn();
      const wrapperClickMock = jest.fn();

      const {queryByTestId} = render(
        <ButtonDemo
          testId="demo"
          handleMainClick={mainClickMock}
          handleWrapperClick={wrapperClickMock}
        />
      );

      // Fire an event specifically on the anchor tag
      fireEvent.click(queryByTestId('demo-image'));

      // Expect the main click to fire twice
      // Expect it to fire once for the button
      // Expect it to fire a second time due to clicking on the nested image
      expect(mainClickMock).toHaveBeenCalledTimes(2);

      // Expect the href to match the location we assigned
      expect(global.location.href.includes('main')).toBe(true);
    });

    it('fires main click when you click other non-interactive element within the card', () => {
      const mainClickMock = jest.fn();
      const wrapperClickMock = jest.fn();

      const {queryByTestId} = render(
        <ButtonDemo
          testId="demo"
          handleMainClick={mainClickMock}
          handleWrapperClick={wrapperClickMock}
        />
      );

      // Fire an event specifically on the anchor tag
      fireEvent.click(queryByTestId('demo-description'));

      // Expect the wrapper click to fire twice
      // Wrapper fires once when clicking the entire container
      // Wrapper fires a second time when handleA11yClick is invoked for the fallback to our ref element
      expect(wrapperClickMock).toHaveBeenCalledTimes(2);

      // Expect our main click to fire once because it is called to be fired by the ref
      expect(mainClickMock).toHaveBeenCalledTimes(1);

      // Expect the href to match the location we assigned
      expect(global.location.href.includes('main')).toBe(true);
    });

    it("doesn't trigger main click when interacting with nested anchor link", () => {
      const mainClickMock = jest.fn();
      const wrapperClickMock = jest.fn();

      const {queryByTestId} = render(
        <ButtonDemo
          handleMainClick={mainClickMock}
          handleWrapperClick={wrapperClickMock}
          testId="demo"
        />
      );

      // Fire an event specifically on the second anchor tag
      fireEvent.click(queryByTestId('demo-second'));

      // Expect the wrapper was fired because we are clicking inside a nested click event
      // Since we don't fallback to the main event this will only occur once
      expect(wrapperClickMock).toHaveBeenCalledTimes(1);

      // Our main click does not run since it fallback was not invoked
      expect(mainClickMock).toHaveBeenCalledTimes(0);

      // Sanity check that main isn't fired before our manual update of the native anchor link
      expect(global.location.href.includes('#main')).toBe(false);
    });

    it('successfully fires correct values for either the main or the secondary links', () => {
      const mainClickMock = jest.fn();
      const wrapperClickMock = jest.fn();

      const {queryByTestId} = render(
        <ButtonDemo
          handleMainClick={mainClickMock}
          handleWrapperClick={wrapperClickMock}
          testId="demo"
        />
      );

      // Fire an event specifically on the second anchor tag
      fireEvent.click(queryByTestId('demo-second'));

      // Expect the wrapper was fired because we are clicking inside a nested click event
      // Since we don't fallback to the main event this will only occur once
      expect(wrapperClickMock).toHaveBeenCalledTimes(1);

      // Our main click does not run since it fallback was not invoked
      expect(mainClickMock).toHaveBeenCalledTimes(0);

      // Sanity check that main isn't fired before our manual update of the native anchor link
      expect(global.location.href.includes('main')).toBe(false);

      // Manually fire the location.assign to simulate the value of event above from the native anchor tag element
      location.assign(queryByTestId('demo-second').getAttribute('href'));

      // Expect the href to be the secondary click
      expect(global.location.href.includes('#second')).toBe(true);

      // Fire an event on the containing element to confirm both links work
      fireEvent.click(queryByTestId('demo-wrapper'));

      // Expect the href to match the location we assigned
      expect(global.location.href.includes('main')).toBe(true);
    });

    it('fires the internal button event when clicking the third button', () => {
      const mainClickMock = jest.fn();
      const thirdClickMock = jest.fn();
      const wrapperClickMock = jest.fn();
      const {queryByTestId} = render(
        <ButtonDemo
          testId="demo"
          handleMainClick={mainClickMock}
          handleWrapperClick={wrapperClickMock}
          handleThirdClick={thirdClickMock}
        />
      );

      fireEvent.click(queryByTestId('demo-third'));

      // Expect the wrapper was fired because we are clicking inside a nested click event
      // Since we don't fallback to the main event this will only occur once
      expect(wrapperClickMock).toHaveBeenCalledTimes(1);

      // Our main click does not run since it fallback was not invoked
      expect(mainClickMock).toHaveBeenCalledTimes(0);

      // Expect the internal button was clicked
      expect(thirdClickMock).toHaveBeenCalledTimes(1);

      // Expect that firing the event will update the URL what was fired
      expect(global.location.href.includes('#third')).toBe(true);
    });
  });
});
