import { fireEvent, render, screen } from '@testing-library/vue'
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

  it('renders directional arrow icons alongside the labels', () => {
    const { getByRole, container } = render(PaginationControls, {
      props: {
        currentPage: 2,
        totalPages: 3,
      },
    })

    const previousButton = getByRole('button', { name: /previous/i })
    const nextButton = getByRole('button', { name: /next/i })

    expect(previousButton).toBeInTheDocument()
    expect(nextButton).toBeInTheDocument()
    expect(previousButton.querySelector('.arrow-icon--left')).not.toBeNull()
    expect(nextButton.querySelector('.arrow-icon--right')).not.toBeNull()
    expect(container.querySelectorAll('.arrow-icon')).toHaveLength(2)
  })
})
