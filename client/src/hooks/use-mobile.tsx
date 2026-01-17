import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useBreakpoints() {
  const [breakpoints, setBreakpoints] = React.useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true
  })

  React.useEffect(() => {
    const checkBreakpoints = () => {
      const width = window.innerWidth
      setBreakpoints({
        isMobile: width < MOBILE_BREAKPOINT,
        isTablet: width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT,
        isDesktop: width >= TABLET_BREAKPOINT
      })
    }
    
    checkBreakpoints()
    window.addEventListener("resize", checkBreakpoints)
    return () => window.removeEventListener("resize", checkBreakpoints)
  }, [])

  return breakpoints
}
