## Boulevard Charts

A framework for embedding charts into an application through iframes.

Not ready for general usage yet.

## Installation

If [available in Hex](https://hex.pm/docs/publish), the package can be installed as:

  1. Add `boulevard_charts` to your list of dependencies in `mix.exs`:

    ```elixir
    def deps do
      [{:boulevard_charts, github: "Boulevard/boulevard_charts"}]
    end
    ```

  2. Ensure `boulevard_charts` is started before your application:

    ```elixir
    def application do
      [applications: [:boulevard_charts]]
    end
    ```

## Development

* Install (if you don't have them):
    * [Node.js](http://nodejs.org): `brew install node` on OS X
    * [Brunch](http://brunch.io): `npm install -g brunch`
    * Brunch plugins and app dependencies: `npm install`
* Run:
    * `brunch watch --server` — watches the project with continuous rebuild. This will also launch HTTP server with [pushState](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history).
    * `brunch build --production` — builds minified project for production
* Learn:
    * `public/` dir is fully auto-generated and served by HTTP server.  Write your code in `app/` dir.
    * Place static files you want to be copied from `app/assets/` to `public/`.
    * [Brunch site](http://brunch.io), [Getting started guide](https://github.com/brunch/brunch-guide#readme)

## ES7

    To use proposed JS features not included into ES6, do this:

    * `npm install --save-dev babel-preset-stage-0`
    * in `brunch-config.js`, add the preset: `presets: ['es2015', 'stage-0']`
