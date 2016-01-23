# AlephBet

AlephBet is a pure-javascript A/B (multivariate) testing framework for developers.

Key Features:

* **NEW**: run your own tracking backend on AWS Lambda with [Gimel](https://github.com/Alephbet/gimel) (optional)
* Pluggable backends: event tracking (defaults to Google Universal Analytics), and storage (defaults to
  localStorage)
* Supports multiple variants and goals
* Tracks unique visitors and goal completions
* Flexible triggers
* Ideal for use with page and fragment caching
* Developer-friendly for both usage and contirbution (using npm / browserify)
* less than 5kb when minified and gzipped with no external dependencies

## What does AlephBet mean?

Aleph (אלף) Bet (בית) are the first two letters in the Hebrew alphabet. Similar to A and B.

## Inspiration

AlephBet was heavily inspired by Optimizely (sans WYSIWYG and reporting) and
[Cohorts.js](https://github.com/jamesyu/cohorts).
The code structure and some code elements were taken from cohorts.js, with some notable changes to terminology and
built-in support for unique goals and visitor tracking.

For more detailed info about the background and rationale for creating AlephBet, please check out this [blog
post](http://blog.gingerlime.com/2015/alephbet-javascript-ab-test-framework-for-developers/)

## Screencast

[![AlephBet Screencast](https://img.youtube.com/vi/NGJ0kdsxNIc/0.jpg)](https://www.youtube.com/watch?v=NGJ0kdsxNIc&vq=hd1080)

[code snippet used on the screencast](http://codepen.io/anon/pen/xGLrRV?editors=001)

for more screencasts, tips and info, please check the [wiki](https://github.com/gingerlime/alephbet/wiki)

## Quick Start

* Make sure your Google Universal analytics is set up.
* [Download](https://github.com/gingerlime/alephbet/releases/latest) and include `alephbet.min.js` in the head section of your HTML.
* Create an experiment:

```javascript
var button_color_experiment = new AlephBet.Experiment({
  name: 'button color',  // the name of this experiment; required.
  variants: {  // variants for this experiment; required.
    blue: {
      activate: function() {  // activate function to execute if variant is selected
        $('#my-btn').attr('style', 'color: blue;');
      }
    },
    red: {
      activate: function() {
        $('#my-btn').attr('style', 'color: red;');
      }
    }
  },
});
```

* Track goals for your experiment:

```javascript
// creating a goal
var button_clicked_goal = new AlephBet.Goal('button clicked');
$('#my-btn').on('click', function() {
  // The chosen variant will be tied to the goal automatically
  button_clicked_goal.complete();
});

// adding experiment to the goal
button_clicked_goal.add_experiment(button_color_experiment);

// alternatively - add the goal to the experiment
button_color_experiment.add_goal(button_clicked_goal);

// tracking non-unique goals, e.g. page views
var page_views = new AlephBet.Goal('page view', {unique: false});
```

* view results on your Google Analytics Event Tracking Section. The experiment name + variation will be assigned to  `actions`, and Visitors or Goals to `label`. e.g.
  - action: `button color | red`, label: `Visitors` : unique count of visitors assigned to the `red` variant.
  - `button color | blue`, `button clicked` : unique visitors clicking on the button assigned to the `blue` variant.
  - `button color | red`, `viewed page` : count of pages viewed by all visitors (not-unique) *after* the experiment started.

## Advanced Usage

### Recommended Usage Pattern

AlephBet was meant to be used across different pages, tracking multiple goals over simultaneous experiments. It is
therefore recommended to keep all experiments in one javascript file, shared across all pages. This allows sharing goals
across different experiments. Experiments can be triggered based on a set of conditions, allowing to fine-tune the
audience for the experiments (e.g. mobile users, logged-in etc).

### Triggers

Experiments automatically start by default. However, a trigger function can be provided, to limit the audience or the
page(s) where the experiment takes place.

```javascript
var button_color_experiment = new AlephBet.Experiment({
  name: 'button color',
  trigger: function() {
    return window.location.href.match(/pricing/);
  },
  variants: { // ...
  },
});

// triggers can be assigned to a variable and shared / re-used
var logged_in_user = function() { return document.cookie.match(/__session/); };
var mobile_browser = function() { // test if mobile browser };

var big_header_experiment = new AlephBet.Experiment({
  name: 'big header',
  trigger: function() { return logged_in_user() && mobile_browser(); },
  // ...
});
```

### Sample size

You can specify a `sample` float (between 0.0 and 1.0) to limit the number of visitors participating in an experiment.

### Visitors

Visitors will be tracked once they participate in an experiment (and only once). Once a visitor participates in an
experiment, the same variant will always be shown to them. If visitors are excluded from the sample, they will be
permanently excluded from seeing the experiment. Triggers however will be checked more than once, to allow launching
experiments under specific conditions for the same visitor.

### Goals

Goals are uniquely tracked by default. i.e. if a goal is set to measure how many visitors clicked on a button, multiple
clicks won't generate another goal completion. Only one per visitor. Non-unique goals can be set by passing `unique: false` to the goal when creating it.

Goals will only be tracked if the experiment was launched and a variant selected before. Tracking goals is therefore
safe and idempotent (unless unique is false).

Here's a short sample of tracking multiple goals over multiple experiments:

```javascript
// main goal - button click
var button_click_goal = new AlephBet.Goal('button click');
$('#my-btn').on('click', function() {
  button_clicked_goal.complete();
});

// engagement - any click on the page
var engagement = new AlephBet.Goal('engagement');
$('html').on('click', function() {
  engagement.complete();
});

var all_goals = [button_click_goal, engagement];

// experiments
var button_color_experiment = new AlephBet.Experiment({ /* ... */ });
var buy_button_cta_experiment = new AlephBet.Experiment({ /* ... */ });

// adding all goals to experiments
_(all_goals).each(function (goal) {
  button_color_experiment.add_goal(goal);
  buy_button_cta_experiment.add_goal(goal);
});

// alternatively, you can use the add_goals method and pass it an array of goals
button_color_experiment.add_goals(all_goals);
buy_button_cta_experiment.add_goals(all_goals);
```

### Custom Tracking Adapter

AlephBet comes with a built-in Google Analytics adapter and two, currently experimental, [adapters](../../wiki/Tips-&-Caveats#persistent-queue-adapters) with potentially better accuracy:

[Persistent Queue GA Adapter](../../wiki/Tips-&-Caveats#persistentqueuegoogleanalyticsadapter)

[Persistent Queue Keen Adapter](../../wiki/Tips-&-Caveats#persistentqueuekeenadapter)

Creating custom adapters is however very easy.

Here's an example for integrating an adapter for [keen.io](https://keen.io)

```html
<script src="https://d26b395fwzu5fz.cloudfront.net/3.2.4/keen.min.js" type="text/javascript"></script>
<script src="alephbet.min.js"></script>
<script type="text/javascript">
    window.keen_client = new Keen({
        projectId: "ENTER YOUR PROJECT ID",
        writeKey: "ENTER YOUR WRITE KEY"
    });
    var tracking_adapter = {
        experiment_start: function(experiment_name, variant) {
            keen_client.addEvent(experiment_name, {variant: variant, event: 'participate'});
        },
        goal_complete: function(experiment_name, variant, event_name) {
            keen_client.addEvent(experiment_name, {variant: variant, event: event_name});
        }
    };
    var my_experiment = new AlephBet.Experiment({
        name: 'my experiment',
        variants: { // ...
        },
        tracking_adapter: tracking_adapter,
        // ...
    });
</script>

```

### Custom Storage Adapter

Similar to the tracking adapter, you can customize the storage adapter. AlephBet uses localStorage by default, but if you want to use cookies or customize how data is persisted on the client, creating an adapter is very easy.

Here's a simple example of a cookie storage adapter with expiry of 30 days, using
[js-cookie](https://github.com/js-cookie/js-cookie):

```html
<script src="/path/to/js.cookie.js"></script>
<script type="text/javascript">
    // NOTE: using JSON stringify / parse to allow storing more complex values
    var storage_adapter = {
        set: function(key, value) {
            Cookies.set(key, JSON.stringify(value), {expires: 30});
        },
        get: function(key) {
            try { return JSON.parse(Cookies.get(key)); } catch(e) { return Cookies.get(key); }
        }
    };
    var my_experiment = new AlephBet.Experiment({
        name: 'my experiment',
        variants: { // ...
        },
        storage_adapter: storage_adapter,
        // ...
    });
```

### Debug mode

To set more verbose logging to the browser console, use `AlephBet.options.debug = true`.

### Other install options

* download `alephbet.min.js` from the `dist` folder on github
* `npm install alephbet`
* `bower install alephbet`

## Analyzing results

AlephBet is built for developers, so there's no fancy interface or WYSIWYG editors. The best way to analyze the results
and determine the best variant from an experiment is to look at the raw data and calculate the statistical significance.
A couple of recommended resources:

* [Thumbtack's ABBA A/B Test Calculator](https://www.thumbtack.com/labs/abba/)
* [Evan Miller's A/B Testing tools](http://www.evanmiller.org/ab-testing/)

## Development

AlephBet uses npm / browserify with the following 3rd party libraries:

* [lodash](https://lodash.com/) (using a custom build, to save space)
* [store.js](https://github.com/marcuswestin/store.js) - for localStorage

### Commands

* `npm run build` - to build both development and minified version + prerequisites
* `npm run watch` - will watch files and re-build using `watchify`

## License

AlephBet is distributed under the MIT license. All 3rd party libraries and components are distributed under their
respective license terms.

```
Copyright (C) 2015 Yoav Aner

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
