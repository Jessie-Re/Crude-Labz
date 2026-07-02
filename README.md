# Crude-Labz

A static black-and-white product landing page with shopping cart behavior and order summary.

## Structure

- `index.html` — main landing page
- `products.html` — products page
- `cart.html` — cart summary page
- `css/style.css` — styles
- `js/script.js` — cart + order logic
- `images/` — image assets

## Local preview

Open `index.html` in your browser, or run a local server:

```powershell
cd 'C:\Users\jjosi\Desktop\New folder\Crude-Labz'
python -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub deploy

1. Create a new GitHub repo named `Crude-Labz`.
2. Set the remote URL locally:

```powershell
git remote set-url origin https://github.com/<your-username>/Crude-Labz.git
```

3. Push to GitHub:

```powershell
git push -u origin main
```

4. Enable GitHub Pages in the repo settings, using the `main` branch.
