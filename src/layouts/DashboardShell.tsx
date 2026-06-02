import { useEffect, useState } from 'react'
import CustomAlert from '../components/ui/CustomAlert'
import { useThemeStore } from '../store/themeStore'

export interface NavSubItem {
  id: string
  label: string
  icon?: React.ReactNode
}

export interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  children?: NavSubItem[]
}

export interface NavSection {
  title: string
  items: NavItem[]
}

interface DashboardShellProps {
  children: React.ReactNode
  navItems?: NavItem[]
  navSections?: NavSection[]
  activeView: string
  onNavigate: (id: string) => void
  user: { name: string; email: string } | null
  onLogout: () => void
  logoLabel: string
  logoAccent?: string
  pageTitle: string
  supportsTheme?: boolean
  onProfileClick?: () => void
  headerExtras?: React.ReactNode
}

export default function DashboardShell({
  children,
  navItems,
  navSections,
  activeView,
  onNavigate,
  user,
  onLogout,
  logoLabel,
  logoAccent,
  pageTitle,
  supportsTheme = true,
  onProfileClick,
  headerExtras,
}: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { theme, toggleTheme } = useThemeStore()

  useEffect(() => {
    if (!supportsTheme) return
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme, supportsTheme])

  // Close sidebar and user menu whenever the active view changes
  const resolvedSections: NavSection[] =
    navSections ?? (navItems ? [{ title: '', items: navItems }] : [])

  const flatNavItems = resolvedSections.flatMap((s) => s.items)

  const autoExpandedParentId = flatNavItems.find((item) =>
    item.children?.some((c) => c.id === activeView)
  )?.id

  const handleNavigate = (id: string) => {
    setIsSidebarOpen(false)
    setIsUserMenuOpen(false)
    onNavigate(id)
  }

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const isItemActive = (item: NavItem): boolean => {
    if (item.children) return item.children.some((c) => c.id === activeView)
    return activeView === item.id
  }

  const isGroupExpanded = (item: NavItem): boolean =>
    expandedGroups.has(item.id) || item.id === autoExpandedParentId || isItemActive(item)

  const navItemClass = (active: boolean) =>
    `flex w-full items-center justify-start gap-x-3.5 overflow-hidden rounded-xl px-4 py-3 whitespace-nowrap transition-all outline-none ${
      active
        ? 'border border-teal-100 bg-teal-50 text-teal-700 shadow-sm dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-400'
        : 'border border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200'
    }`

  const subNavItemClass = (active: boolean) =>
    `flex w-full items-center gap-x-3 overflow-hidden rounded-xl px-4 py-2.5 text-sm whitespace-nowrap transition-all outline-none ${
      active
        ? 'border border-teal-100 bg-white text-teal-700 shadow-sm dark:border-teal-500/20 dark:bg-[#131314] dark:text-teal-400'
        : 'border border-transparent text-slate-500 hover:bg-slate-50 hover:text-teal-600 dark:text-zinc-400 dark:hover:bg-[#131314] dark:hover:text-teal-400'
    }`

  return (
    <div className="relative min-h-screen bg-slate-50 font-['Inter'] dark:bg-[#131314]">
      <CustomAlert />

      {/* Sidebar Focus Overlay */}
      <div
        className={`fixed inset-0 z-60 bg-white/40 backdrop-blur-sm transition-all duration-300 dark:bg-[#131314]/80 ${ isSidebarOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0' }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* ========================================== */}
      {/* SIDEBAR                                     */}
      {/* ========================================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-70 flex flex-col border-r border-slate-200 bg-white transition-all duration-500 ease-in-out dark:border-zinc-800 dark:bg-[#1e1f20] ${ isSidebarOpen ? 'w-72 translate-x-0 shadow-2xl lg:shadow-none' : 'w-72 -translate-x-full lg:w-[76px] lg:translate-x-0' }`}
      >
        {/* Sidebar header */}
        <header className="flex h-16 shrink-0 items-center px-[18px]">
          <button
            type="button"
            onClick={() => setIsSidebarOpen((s) => !s)}
            className="flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition-all hover:bg-slate-50 focus:outline-none dark:border-zinc-800 dark:bg-[#131314] dark:text-zinc-400 dark:hover:bg-zinc-900"
            title={isSidebarOpen ? 'Kecilkan Navigasi' : 'Besarkan Navigasi'}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {isSidebarOpen && (
            <span className="animate-in fade-in ml-3 font-['Manrope'] text-base tracking-tight text-zinc-950 duration-200 dark:text-white">
              {logoLabel}
              {logoAccent && <span className="text-teal-600 dark:text-teal-400">{logoAccent}</span>}
            </span>
          )}
        </header>

        {/* Navigation */}
        <nav className="mt-2 flex-1 overflow-x-hidden overflow-y-auto p-3 [&::-webkit-scrollbar]:hidden">
          <div className="flex w-full flex-col space-y-4">
            {resolvedSections.map((section) => (
              <div key={section.title || 'default'} className="flex flex-col">
                {section.title && isSidebarOpen && (
                  <p className="animate-in fade-in mb-2 px-4 text-[10px] tracking-widest text-slate-400 uppercase duration-200 dark:text-zinc-500">
                    {section.title}
                  </p>
                )}
                {section.title && !isSidebarOpen && (
                  <div
                    className="mx-auto mb-2 hidden h-px w-8 bg-slate-200 lg:block dark:bg-zinc-700"
                    aria-hidden
                  />
                )}
                <ul className="flex w-full flex-col space-y-1.5">
                  {section.items.map((item) => {
              const active = isItemActive(item)

              if (item.children) {
                const expanded = isGroupExpanded(item)
                return (
                  <li key={item.id} className="flex w-full flex-col">
                    <button
                      onClick={() => {
                        if (!isSidebarOpen) {
                          setIsSidebarOpen(true)
                          setExpandedGroups((prev) => new Set([...prev, item.id]))
                        } else {
                          toggleGroup(item.id)
                        }
                      }}
                      title={!isSidebarOpen ? item.label : undefined}
                      className={navItemClass(active)}
                    >
                      <span className="h-5 w-5 shrink-0">{item.icon}</span>
                      <span
                        className={`flex-1 text-left text-sm font-medium ${ !isSidebarOpen ? 'lg:hidden' : 'animate-in fade-in block duration-200' }`}
                      >
                        {item.label}
                      </span>
                      {isSidebarOpen && (
                        <svg
                          className={`h-4 w-4 shrink-0 transition-transform duration-300 ${ expanded ? 'rotate-180 text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-zinc-500' }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>

                    {expanded && isSidebarOpen && (
                      <ul className="animate-in fade-in zoom-in-95 mt-1.5 ml-5 space-y-1 border-l-2 border-teal-50 pr-2 pl-9 duration-100 ease-out dark:border-zinc-800">
                        {item.children.map((child) => (
                          <li key={child.id}>
                            <button
                              onClick={() => handleNavigate(child.id)}
                              className={subNavItemClass(activeView === child.id)}
                            >
                              {child.icon && <span className="h-4 w-4 shrink-0">{child.icon}</span>}
                              <span className="font-medium">{child.label}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )
              }

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigate(item.id)}
                    title={!isSidebarOpen ? item.label : undefined}
                    className={navItemClass(active)}
                  >
                    <span className="h-5 w-5 shrink-0">{item.icon}</span>
                    <span
                      className={`text-sm font-medium ${ !isSidebarOpen ? 'lg:hidden' : 'animate-in fade-in block duration-200' }`}
                    >
                      {item.label}
                    </span>
                  </button>
                </li>
              )
            })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* User footer */}
        <div className="relative shrink-0 border-t border-slate-100 bg-white p-3 transition-colors dark:border-zinc-800 dark:bg-[#1e1f20]">
          <div className="relative w-full">
            <button
              onClick={() => setIsUserMenuOpen((o) => !o)}
              className={`flex w-full items-center rounded-xl py-1.5 transition-colors outline-none hover:bg-slate-50 dark:hover:bg-zinc-800/80 ${ isSidebarOpen ? 'justify-start gap-x-3 px-3' : 'justify-center' }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-teal-200 bg-teal-100 text-teal-700 shadow-sm dark:border-zinc-800 dark:bg-[#131314] dark:text-teal-400">
                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
              {isSidebarOpen && (
                <div className="animate-in fade-in flex min-w-0 flex-1 items-center text-start duration-200">
                  <span className="truncate text-sm text-zinc-900 dark:text-zinc-100">
                    {user?.name ?? 'Pengguna'}
                  </span>
                  <svg
                    className={`ms-auto h-4 w-4 shrink-0 text-slate-400 transition-transform dark:text-zinc-500 ${ isUserMenuOpen ? 'rotate-180' : '' }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}
            </button>

            {isUserMenuOpen && (
              <div
                className={`animate-in fade-in zoom-in-95 absolute bottom-full left-0 z-50 mb-2 origin-bottom overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl transition-colors duration-150 ease-out dark:border-zinc-800 dark:bg-[#1e1f20] ${ isSidebarOpen ? 'w-full' : 'left-2 w-56' }`}
              >
                <div className="p-1.5">
                  <div className="mb-1 border-b border-slate-100 px-3 py-2 dark:border-zinc-800">
                    <p className="text-[10px] tracking-widest text-slate-400 uppercase dark:text-zinc-500">
                      Email Sesi
                    </p>
                    <p className="mt-0.5 truncate text-xs text-zinc-800 dark:text-zinc-300">
                      {user?.email}
                    </p>
                  </div>

                  {supportsTheme && (
                    <div className="mb-1 flex items-center justify-between border-b border-slate-100 px-3 py-2 dark:border-zinc-800">
                      <span className="text-xs text-slate-700 dark:text-zinc-300">
                        Mode Gelap
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleTheme()
                        }}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full shadow-inner transition-colors outline-none ${ theme === 'dark' ? 'bg-teal-500' : 'bg-slate-200 dark:bg-zinc-700' }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${ theme === 'dark' ? 'translate-x-4' : 'translate-x-1' }`}
                        />
                      </button>
                    </div>
                  )}

                  {onProfileClick && (
                    <button
                      onClick={() => {
                        onProfileClick()
                        setIsUserMenuOpen(false)
                      }}
                      className="mb-0.5 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
                    >
                      Profil Saya
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false)
                      onLogout()
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                  >
                    Keluar Sistem
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ========================================== */}
      {/* MAIN CONTENT WRAPPER                        */}
      {/* ========================================== */}
      <div className="flex min-w-0 flex-1 flex-col transition-all duration-300 lg:pl-[76px]">
        {/* Ambient background decorations */}
        <div className="pointer-events-none fixed -top-48 -left-48 h-96 w-96 rounded-full bg-teal-100 opacity-60 blur-[120px] transition-colors dark:bg-teal-900/40 dark:opacity-40" />
        <div className="pointer-events-none fixed -right-48 -bottom-48 h-96 w-96 rounded-full bg-blue-100 opacity-60 blur-[120px] transition-colors dark:bg-blue-900/40 dark:opacity-40" />

        {/* ========================================== */}
        {/* TOP NAVBAR                                  */}
        {/* ========================================== */}
        <header className="fixed top-0 right-0 left-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md transition-all duration-300 sm:px-6 lg:left-[76px] dark:border-zinc-800 dark:bg-[#131314]/80">
          <div className="flex items-center gap-x-4">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="-ml-2 flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none lg:hidden dark:border-zinc-800 dark:bg-[#1e1f20] dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <h1
              key={activeView}
              className="animate-in fade-in slide-in-from-left-4 font-['Manrope'] text-lg font-extrabold tracking-tight text-zinc-900 duration-300 sm:text-xl dark:text-zinc-100"
            >
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-x-3 sm:gap-x-4">
            {supportsTheme && (
              <>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="relative flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-500 shadow-sm transition-all hover:bg-slate-100 hover:text-teal-600 focus:outline-none dark:border-zinc-800 dark:bg-[#1e1f20] dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-teal-400"
                  title={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
                >
                  <div className="relative h-5 w-5">
                    <svg
                      className={`absolute inset-0 h-5 w-5 transition-all duration-500 ease-in-out ${ theme === 'dark' ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-90 opacity-0' }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <svg
                      className={`absolute inset-0 h-5 w-5 transition-all duration-500 ease-in-out ${ theme === 'light' ? 'scale-100 rotate-0 opacity-100' : 'scale-50 rotate-90 opacity-0' }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                  </div>
                </button>
                <div className="hidden h-6 w-px bg-slate-200 sm:block dark:bg-zinc-800" />
              </>
            )}

            {headerExtras}
          </div>
        </header>

        {/* ========================================== */}
        {/* PAGE CONTENT                               */}
        {/* ========================================== */}
        <main className="relative z-10 mx-auto mt-16 w-full max-w-[1440px] flex-1 px-4 py-8 sm:px-6 md:py-10 lg:px-12">
          {children}
        </main>
      </div>
    </div>
  )
}
