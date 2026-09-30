'use client';

import { cloneElement, Fragment, isValidElement, ReactNode } from 'react';
import { useLocale } from './LocaleProvider';

function translateNode(node: ReactNode, t: (phrase: string) => string): ReactNode {
  if (typeof node === 'string') {
    const trimmed = node.trim();
    if (!trimmed) return node;
    const translated = t(trimmed);
    return translated === trimmed ? node : node.replace(trimmed, translated);
  }

  if (Array.isArray(node)) return node.map((child) => translateNode(child, t));
  if (!isValidElement<{ children?: ReactNode; translate?: string; [key: string]: unknown }>(node)) return node;
  if (node.props.translate === 'no' || node.props['data-no-translate'] === true) return node;

  const props = { ...node.props };
  for (const attribute of ['aria-label', 'placeholder', 'title'] as const) {
    const value = props[attribute];
    if (typeof value === 'string') props[attribute] = translateNode(value, t);
  }

  if (node.type === Fragment || typeof node.type !== 'string') {
    return cloneElement(node, props, translateNode(node.props.children, t));
  }

  return cloneElement(node, props, translateNode(node.props.children, t));
}

export function LocalizedContent({ children }: { children: ReactNode }) {
  const { t } = useLocale();
  return <>{translateNode(children, t)}</>;
}