export function useTheme() {
  const isDark = useState<boolean>('isDarkMode', () => false);

  function applyTheme(dark: boolean) {
    if (!import.meta.client) return;
    const root = document.documentElement;
    const themeName = dark ? 'dark' : 'light';

    root.classList.remove('light', 'dark');
    root.classList.add(themeName);
    root.style.colorScheme = themeName;

    try {
      localStorage.setItem('susi-theme', JSON.stringify(dark));
    } catch (e) {
      console.error('Failed to save theme in localStorage', e);
    }
  }

  function toggleTheme(event?: MouseEvent) {
    if (!import.meta.client) return;
    const nextDark = !isDark.value;
    const nextTheme = nextDark ? 'dark' : 'light';

    // Fallback if browser doesn't support View Transitions API
    if (!document.startViewTransition) {
      isDark.value = nextDark;
      applyTheme(nextDark);
      return;
    }

    // Get click origin — default to center of screen (e.g. keyboard shortcut)
    const x = event?.clientX ?? window.innerWidth / 2;
    const y = event?.clientY ?? window.innerHeight / 2;

    // Calculate maximum radius to cover screen
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      isDark.value = nextDark;
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(nextTheme);
      root.style.colorScheme = nextTheme;

      try {
        localStorage.setItem('susi-theme', JSON.stringify(nextDark));
      } catch (e) {
        console.error('Failed to save theme', e);
      }
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  }

  // Initialize theme on client mount
  if (import.meta.client) {
    onMounted(() => {
      try {
        const saved = localStorage.getItem('susi-theme');
        if (saved !== null) {
          const parsed = JSON.parse(saved);
          isDark.value = Boolean(parsed);
        } else {
          // Default mode is strictly Light as per requirement
          isDark.value = false;
        }
      } catch {
        isDark.value = false;
      }
      applyTheme(isDark.value);
    });
  }

  return {
    isDark,
    toggleTheme,
    setDark: (val: boolean) => {
      isDark.value = val;
      applyTheme(val);
    }
  };
}
