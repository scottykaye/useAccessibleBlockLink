# Semantic Block Links

`useAccessibleBlockLink` is a reusable react hook that preserves a components semantic accessibility to create a visual block link. This hook supports multiple links within the same block.

### The problem we're solving for

When creating block links where there are semantic tags used inside an interactive element `<a>` or `<button>` we lose all semantic value we've placed inside that block solely to create larger visual click radius.

_Example_

```
<a href="..." title="...">
  <h2>...</h2>
  <ul>
    <li>
      <h3>...</h3>
      <p>...</h3>
    <li>
    ...
  </ul>
  <p></p>
</a>
```

The result of this when coupled with a lot of content is a poor accessiblity experience for all users who are not visual.
This issue exacerbates itself when we mutiple this effect for user interface solutions Cards, Product Cards, wrapping selectable functionality and fully clickable table rows.

### Our solution

```jsx
// Create a ref to provide to the hook for what we want the main event of the block link to be
const mainEvent = useRef();

// Get back the `handleClick` event to set on the container or wrapper of our block link
const {handleClick} = useAccessibleBlockLink(mainEvent);

// Provide the click event on our block link wrapper
// Provide the mainEvent ref on the element we want non-interactive clicks to fallback to
return (
  <div onClick={handleClick}>
    <a ref={mainEvent} href="/home">
      Home
    </a>
    <p>description</p>
  </div>
);
```

Providing a react hook that requires a single ref to the interactive element we establish to be are block links main event. By placing the click handler the hook gives back on the wrapping block link element we create our block links boundaries.

The hook handles determining if the event is an interactive element or not. If the element is interactive we allow the native browersr to handle it. If the element is non-interactive we fallback to the event we have provided on our ref as our main event.

## Usage

Below we have an example of a block link. This block link provides the new ref to the item we want to be the main event (Home). We get back the `handleClick`handler that monitors if we are clicking a interactive or non-interactive element.

By placing the `handleClick` handler on the wrapping element it help determine whether or not we are firing a interactive or non-interactive element. It allows interactive elements to operate native to the browers behavior. When non-interactive elements are detected, it falls back to the event provided on the main event (`mainEvent`) ref.

`<a>` as main event example:

```jsx
const BlockLink = () => {
  const mainEvent = useRef();

  const {handleClick} = useAccessibleBlockLink(mainEvent);

  return (
    <div onClick={handleClick}>
      <a ref={mainEvent} href="/home">
        Home
      </a>
      <p>description</p>
      <button type="button" onClick={() => {}}>
        secondary action
      </button>
    </div>
  );
};
```

The hook works interchangeably for `<a>` and `<button>` tags as the user sees fit. The solution also allows for as many nested interactive elements as the user wants.

`<button>` as main event example:

```jsx
const BlockLink = () => {
  const mainEvent = useRef();

  const {handleClick} = useAccessibleBlockLink(mainEvent);

  return (
    <div onClick={handleClick}>
      <button
        ref={mainEvent}
        onClick={() => {
          location.assign('/home');
        }}
      >
        Home
      </button>
      <p>description</p>
      <a href="/secondary">secondary action</a>
    </div>
  );
};
```

## Compatibility with React Router

Currently `useAccessibleBlockLink` is compatible with React Router. There isn't compliance yet with React Router's internal `<Link>` component. Users will need to use modify the `history` in React Router 5 using `useHistory` or `useNavigate` in React Router 6.

## Contributors

This project wouldn't exist without the collaboration to resolve this issue. There is a vast future of potential to add to this existing solution. All Contributions are welcome! Please add yourself to our list when contributing. Please see our [contribution guidelines](#contribution-guide).

<div style="display:flex;">
  <a href="https://github.com/scottykaye"><img src="https://avatars.githubusercontent.com/u/5076841?v=4" width="33" height="33" /></a>
  <a href="https://github.com/hamlim"><img src="https://avatars.githubusercontent.com/u/5579638?v=4" width="33" height="33"/></a>
</div>

## Contribution Guide

### Setup

- All new features created should be a new branch off of this existing repo. All pull requests will be required to be reviewed and approved by one of our reviewers.
- Once reviewed we will merge our pull requests using githubs merge process directly to our main branch.
- If the pull request warrants a release we can follow our [release](#releases) process.

### Releases

- This project uses [semvar](https://semver.org/) and runs on yarn. To upgrade please use `yarn publish` the next appropriate package number.
- Before commiting your release be sure to run `yarn && yarn typeCheck && yarn test`. We first want to confirm depedencies. Then run our local TypeScript checking. Lastly we run our tests to confirm our package is in full working order.
- All new features and bug fixes are to be accompanied by a new test to confirm behavior.

## Found a bug?

Please create an issue an using the Github issue template.

Provide:

- A path to recreate the bug.
- An example of the code either:
  - A Pull Request demonstrating the issue.
  - CodeSandbox or Github repository with clear example of the issue.
