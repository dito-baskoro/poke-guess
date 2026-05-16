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
})
