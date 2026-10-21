import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TabbedCodeSnippet from './TabbedCodeSnippet';

describe('TabbedCodeSnippet', () => {
  it('renders a non-interactive empty state when given zero tabs', () => {
    render(<TabbedCodeSnippet tabs={[]} fileName="empty.rs" language="rust" />);

    const emptyState = screen.getByRole('status', { name: /empty code snippet/i });
    expect(emptyState).toBeInTheDocument();
    expect(screen.getByText('No code snippet available.')).toBeInTheDocument();
    expect(screen.getByText('empty.rs')).toBeInTheDocument();

    // Non-interactive: no tablist, tabs, copy buttons, or expand buttons
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('tab')).toHaveLength(0);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('clamps the selected tab index when tabs shrink from two tabs to one', () => {
    const twoTabs = [
      {
        label: 'Rust',
        code: 'pub fn hello() {}',
        language: 'rust',
        fileName: 'lib.rs',
      },
      {
        label: 'TypeScript',
        code: 'export const hello = () => {};',
        language: 'typescript',
        fileName: 'index.ts',
      },
    ];

    const { rerender } = render(<TabbedCodeSnippet tabs={twoTabs} />);

    const tabsBefore = screen.getAllByRole('tab');
    expect(tabsBefore).toHaveLength(2);
    expect(tabsBefore[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabsBefore[1]).toHaveAttribute('aria-selected', 'false');

    // Select the second tab (index 1)
    fireEvent.click(tabsBefore[1]);
    expect(tabsBefore[1]).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('export const hello = () => {};')).toBeInTheDocument();
    expect(screen.getByText('index.ts')).toBeInTheDocument();

    // Shrink tabs from two to one
    const oneTab = [twoTabs[0]];
    rerender(<TabbedCodeSnippet tabs={oneTab} />);

    const tabsAfter = screen.getAllByRole('tab');
    expect(tabsAfter).toHaveLength(1);
    expect(tabsAfter[0]).toHaveTextContent('Rust');
    expect(tabsAfter[0]).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('pub fn hello() {}')).toBeInTheDocument();
    expect(screen.getByText('lib.rs')).toBeInTheDocument();
    expect(screen.queryByText('export const hello = () => {};')).not.toBeInTheDocument();
  });

  it('transitions to the non-interactive empty state when tabs shrink to zero', () => {
    const initialTabs = [
      {
        label: 'Rust',
        code: 'pub fn invoke() {}',
        language: 'rust',
        fileName: 'contract.rs',
      },
    ];

    const { rerender } = render(<TabbedCodeSnippet tabs={initialTabs} />);
    expect(screen.getByRole('tab', { name: 'Rust' })).toHaveAttribute('aria-selected', 'true');

    rerender(<TabbedCodeSnippet tabs={[]} />);
    expect(screen.getByRole('status', { name: /empty code snippet/i })).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('preserves single-snippet fallback props when tabs prop is omitted', () => {
    render(
      <TabbedCodeSnippet
        code="let ledger_seq = env.ledger().sequence();"
        language="rust"
        fileName="sequence.rs"
      />,
    );

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.getByText('sequence.rs')).toBeInTheDocument();
    expect(screen.getByText('let ledger_seq = env.ledger().sequence();')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy code snippet/i })).toBeInTheDocument();
  });
});
