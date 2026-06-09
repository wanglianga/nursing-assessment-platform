import { getLevelBadgeClasses, getNursingLevelLabel } from '@/utils/helpers'
import type { NursingLevel } from '@/types'

interface LevelBadgeProps {
  level: NursingLevel
}

export default function LevelBadge({ level }: LevelBadgeProps) {
  return (
    <span className={getLevelBadgeClasses(level)}>
      {getNursingLevelLabel(level)}
    </span>
  )
}
