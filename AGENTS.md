<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the LED-control prototype client-side with clearly identified demonstration devices; real hardware connectivity requires a separately specified integration.
- Define reusable visual roles in src/styles.css and use the existing Button component for application controls.
- Keep per-tube settings and two preset slots in the client-side screen state, with the control dialog in a separate component; this preserves the demonstration-only scope and isolates the lighting controls.
