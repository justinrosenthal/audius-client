import React, { useState, useCallback, ReactNode } from 'react'

import { Button, ButtonType } from '@audius/stems'
import cn from 'classnames'

import { FeatureFlags } from 'common/services/remote-config'
import { useFlag } from 'hooks/useRemoteConfig'

import styles from './Section.module.css'

const messages = {
  more: 'More'
}

export enum Layout {
  // Nothing special
  NORMAL = 'normal',
  TWO_COLUMN_DYNAMIC_WITH_LEADING_ELEMENT = 'two-column-dynamic-with-leading-element',
  TWO_COLUMN_DYNAMIC_WITH_DOUBLE_LEADING_ELEMENT = 'two-column-dynamic-with-double-leading-element'
}

type SectionProps = {
  title: string
  subtitle?: string
  expandable?: boolean
  expandText?: string
  layout?: Layout
  className?: string
  children?: JSX.Element | JSX.Element[] | ReactNode
}

const Section = ({
  title,
  subtitle,
  expandable,
  expandText,
  layout,
  className,
  children
}: SectionProps) => {
  const { isEnabled: remixablesEnabled } = useFlag(FeatureFlags.REMIXABLES_WEB)
  const [isExpanded, setIsExpanded] = useState(false)
  const expand = useCallback(() => {
    setIsExpanded(true)
  }, [setIsExpanded])

  return (
    <div
      className={cn(styles.section, className, {
        [styles.twoColumnDynamicWithLeadingElement]:
          layout === Layout.TWO_COLUMN_DYNAMIC_WITH_LEADING_ELEMENT,
        [styles.twoColumnDynamicWithDoubleLeadingElement]:
          !remixablesEnabled &&
          layout === Layout.TWO_COLUMN_DYNAMIC_WITH_DOUBLE_LEADING_ELEMENT,
        [styles.twoColumnDynamicWithDoubleLeadingElementTenTile]:
          remixablesEnabled &&
          layout === Layout.TWO_COLUMN_DYNAMIC_WITH_DOUBLE_LEADING_ELEMENT,
        [styles.expandable]: expandable,
        [styles.expanded]: isExpanded
      })}
    >
      <div className={styles.title}>{title}</div>
      <div className={styles.subtitle}>{subtitle}</div>
      <div className={styles.children}>{children}</div>
      {expandable && !isExpanded && (
        <Button
          className={styles.expandButton}
          textClassName={styles.expandButtonText}
          type={ButtonType.PRIMARY_ALT}
          text={expandText || messages.more}
          onClick={expand}
        />
      )}
    </div>
  )
}

export default Section
