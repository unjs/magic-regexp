// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#advanced_searching_with_flags

export type Flag = 'd' | 'g' | 'i' | 'm' | 's' | 'u' | 'y'

/** Generate indices for substring matches */
export const withIndices = 'd'

/** Case-insensitive search */
export const caseInsensitive = 'i'

/** Global search */
export const global = 'g'

/** Multi-line search */
export const multiline = 'm'

/** Allows `.` to match newline characters */
export const dotAll = 's'

/** Treat a pattern as a sequence of unicode code points */
export const unicode = 'u'

/** Perform a "sticky" search that matches starting at the current position in the target string */
export const sticky = 'y'
