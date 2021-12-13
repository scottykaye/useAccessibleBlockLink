export interface EventObject {
  target: {
    localName: string;
    href: string;
    type: string;
    role: string;
  } | null;
}
export interface Props {
  href?: string | null;
  click?(): void;
  current?: Props;
}

export default function useAccessibleBlockLink(props: Props) {
  // Confirm that a main click property is provided to handle the click accessibility.
  if (!props) {
    throw Error(
      "`useAccessibleBlockLink` requires an element ref as it's props that provides back a click event for the wrapping container element and determines what link to fire based on where the users click event occurs."
    );
  }

  function handleClick(e: EventObject) {
    // Check to see if the ref provided is using state or the useRef hook.
    const mainClick = props.current instanceof Element ? props.current : props;

    // Only hoist a click if we are using the hook and we are not clicking on a button or anchor link thats nested.
    // Check that we are not making another element into a button with role.
    // Confirm the element does not have a type. This failsafe confirms we are not firing on form elements or button types
    if (
      e.target.localName !== 'button' &&
      e.target.localName !== 'a' &&
      e.target.role !== 'button' &&
      !e.target.type
    ) {
      // If the main click has an href provided fire it
      if (mainClick.href) {
        location.assign(mainClick.href);
        // else if the main click has a click function attached we know we have a click event to fire
      }
      if (mainClick.click) {
        mainClick.click();
      }
    }
  }

  return {handleClick};
}
