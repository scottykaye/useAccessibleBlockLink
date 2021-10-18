interface EventObject {
  target: {
    localName: string;
    href: string;
    type: string;
    role: string;
  };
}
interface RefProps {
  href?: string | null;
  click?: () => {};
  current?: RefProps;
}

export default function useA11yClick(props: {mainClick: RefProps}) {
  function handleClick(e: EventObject) {
    // Confirm that a main click property is provided to handle the click accessibility.
    if (!props.mainClick) {
      throw Error(
        '`useA11yClick` requires a `mainClick` handle the click around the entire container.'
      );
    }

    // Check to see if the ref provided is using state or the useRef hook.
    const mainClick =
      props.mainClick.current instanceof Element
        ? props.mainClick.current
        : props.mainClick;

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
      } else if (mainClick.click) {
        mainClick.click();
      }
    }
  }

  return {handleClick};
}
