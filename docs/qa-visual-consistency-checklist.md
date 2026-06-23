# RideSync Visual QA Checklist

## Core rhythm
- Verify every screen uses the same vertical rhythm: header, first card, secondary sections, and bottom spacing should feel evenly stepped.
- Confirm compact typography is consistent: `title1` only for primary page titles, `title2` for section headlines, `title3` for dense operational cards.
- Check that cards, sheets, and modals use the same corner language and no surface looks noticeably rounder or flatter than its peers.

## Motion
- Screen entry should fade and lift in subtly, never pop abruptly or slide dramatically.
- Bottom sheets should rise cleanly with no visible jump between scrim and sheet.
- Toasts should arrive and dismiss smoothly without obscuring important top-of-screen controls longer than necessary.
- Press states on buttons, rows, and icon buttons should feel tactile but restrained, with no exaggerated shrink or opacity drop.

## Ride screen
- Verify the resilience banner, alert banner, safety summary, map shell, quick actions, and voice bar stack without visual clutter in both light and dark themes.
- Confirm map overlays remain readable over busy map backgrounds and blur/surface treatment feels premium rather than foggy.
- Ensure stale-location and reconnect messaging is legible at a glance and does not visually compete with SOS state.

## Comms
- Message bubbles should group naturally by sender and timestamp.
- Empty chat state should feel intentional, not like missing data.
- Pull-to-refresh should not break composer spacing or cause visible layout shift.

## Planning
- Summary metrics, planning sections, and brief modal should feel like one system, not separate tools.
- Numeric fields for distance and ETA should align cleanly with adjacent form controls.
- Stop rows and import rows should maintain consistent chip scale and list spacing.

## Squad / Safety
- Hazard, fuel, crash-monitor, insights, and roster sections should read as one operational dashboard.
- Warning, danger, and neutral states should be clearly differentiated without introducing extra colors.
- Experimental labels must remain obvious but not loud enough to dominate the screen.

## Settings / Diagnostics
- Segmented controls for theme, battery saver, reduced cadence, and flags should align to the same width and touch-target standard.
- Diagnostics cards should remain calm and product-grade even when showing error states.
- Verify the diagnostics route feels like an internal premium tool, not a debug dump.

## Haptics
- Room create and join should use a clean success cue.
- Standard quick pings should feel lighter than hazard or emergency actions.
- SOS countdown should escalate with warning-level cadence and finish with a stronger confirmation.
- Ride start should feel distinct and affirmative.

## Light and dark themes
- Check every overlay, blur, and elevated surface in both themes for contrast and edge separation.
- Confirm chips, banners, and alert surfaces retain tone hierarchy in dark mode without glowing.
- Verify no screen uses pure white blocks or muddy dark fills that break the restrained premium palette.
