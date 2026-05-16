import { fireEvent, render, screen, within } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import PaginationControls from '../src/components/PaginationControls.vue'

describe('PaginationControls', () => {
  it('disables previous on the first page and emits next', async () => {
    const { emitted } = render(PaginationControls, {
      props: {
        currentPage: 1,
        totalPages: 16,
      },
    })

    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
    await fireEvent.click(screen.getByRole('button', { name: /next/i }))

    expect(emitted().next).toHaveLength(1)
  })

  it('renders directional arrow labels', () => {
    const { container } = render(PaginationControls, {
      props: {
        currentPage: 2,
        totalPages: 3,
      },
    })

    expect(within(container).getByRole('button', { name: /← previous/i })).toBeInTheDocument()
    expect(within(container).getByRole('button', { name: /next →/i })).toBeInTheDocument()
  })
})
