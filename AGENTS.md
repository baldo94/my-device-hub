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
- Keep per-tube settings and separate two-slot tube/group presets in client-side screen state; reuse the control dialog for groups and apply group changes to every member so both views stay synchronized within the demonstration-only scope.
