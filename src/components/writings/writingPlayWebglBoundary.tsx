import { Component, type ReactNode } from 'react'

type WritingPlayWebglBoundaryProps = { children: ReactNode; fallback: ReactNode }

type WritingPlayWebglBoundaryState = { error: Error | null }

export class WritingPlayWebglBoundary extends Component<
  WritingPlayWebglBoundaryProps,
  WritingPlayWebglBoundaryState
> {
  constructor(props: WritingPlayWebglBoundaryProps) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): WritingPlayWebglBoundaryState {
    return { error }
  }

  render(): ReactNode {
    if (this.state.error) return this.props.fallback
    return this.props.children
  }
}
