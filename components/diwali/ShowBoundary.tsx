"use client";

import { Component, type ReactNode } from "react";

type Props = {
  /** Called once when the show throws: the avatar resets itself to rest. */
  onError: () => void;
  children: ReactNode;
};

type State = { failed: boolean };

/**
 * Wraps the Diwali show so that a render or effect error inside it can never
 * take the homepage down with it: the show simply disappears and `onError`
 * puts the hero photo back at rest. It is mounted with the show and unmounted
 * when the show ends, so the next light starts with a fresh boundary.
 */
export default class ShowBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
