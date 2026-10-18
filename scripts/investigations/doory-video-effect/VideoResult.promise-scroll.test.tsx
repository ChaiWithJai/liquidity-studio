// Original regression test for the attributed upstream Doory VideoResult component.
// This verifies React lifecycle behavior with a scroll API return value, not encoded media.
import { StrictMode } from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { VideoResult } from './VideoResult'
import type { VideoResult as Result } from '../../engine/export/video/types'

const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView')
afterEach(() => {
  if (descriptor) Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', descriptor)
  else delete (HTMLElement.prototype as unknown as Record<string, unknown>).scrollIntoView
  vi.restoreAllMocks()
})
const fixture: Result = {
  blob: new Blob(['lifecycle-only fixture'], { type: 'video/mp4' }),
  filename: 'lifecycle-only.mp4', mime: 'video/mp4', format: 'mp4',
  durationMs: 30000, width: 1080, height: 1920, fps: 30, frames: 900,
  video: 'H.264', audio: null, warnings: [], elapsedMs: 1,
}
for (const returnsPromise of [false, true]) {
  it(`mounts and unmounts in StrictMode when scrollIntoView returns ${returnsPromise ? 'a Promise' : 'undefined'}`, () => {
    const scroll = vi.fn(() => returnsPromise ? Promise.resolve() : undefined)
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: scroll })
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    const view = render(<StrictMode><VideoResult result={fixture} url="blob:lifecycle-only" /></StrictMode>)
    expect(screen.getByTestId('video-result')).toHaveAttribute('data-frames', '900')
    expect(scroll).toHaveBeenCalledWith({ block: 'nearest' })
    expect(scroll.mock.calls.length).toBeGreaterThanOrEqual(2)
    expect(() => view.unmount()).not.toThrow()
    expect(errors).not.toHaveBeenCalled()
  })
}
