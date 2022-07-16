// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#advanced_searching_with_flags

export type Flag = 'd' | 'g' | 'i' | 'm' | 's' | 'u' | 'y'

/** Generate indices for substring matches */
export const withIndices: Flag = 'd'

/** Case-insensitive search */
export const caseInsensitive: Flag = 'i'

/** Global search */
export const global: Flag = 'g'

/** Multi-line search */
export const multiline: Flag = 'm'

/** Allows `.` to match newline characters */
export const dotAll: Flag = 's'

/** Treat a pattern as a sequence of unicode code points */
export const unicode: Flag = 'u'

/** Perform a "sticky" search that matches starting at the current position in the target string */
export const sticky: Flag = 'y'
