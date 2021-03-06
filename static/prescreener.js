function toggleReasons () {
    var reasons = document.getElementById('reasons');
    var why = document.getElementById('why');

    if (reasons) {
        reasons.classList.toggle('hidden');
    }
    if (why) {
        why.classList.toggle('hidden');
    }
}

function showMedicalExpensesForElderlyOrDisabled () {
    var elem = document.getElementById('medical_expenses_for_elderly_or_disabled_question');

    if (elem) {
        if (elem.classList.contains('hidden')) {
            elem.classList.remove('hidden');
        }
    }
}

function hideMedicalExpensesForElderlyOrDisabled () {
    var elem = document.getElementById('medical_expenses_for_elderly_or_disabled_question');

    if (elem) {
        if (!elem.classList.contains('hidden')) {
            elem.classList.add('hidden');
        }
    }
}

function showActualUtilitiesCosts () {
    var utilityAllowance = document.getElementById('utility_allowance_question');
    var actualUtilitiesCosts = document.getElementById('actual_utilities_costs_question');

    if (utilityAllowance && actualUtilitiesCosts) {
        if (actualUtilitiesCosts.classList.contains('hidden')) {
            actualUtilitiesCosts.classList.remove('hidden');
        }

        if (!utilityAllowance.classList.contains('hidden')) {
            utilityAllowance.classList.add('hidden');
        }
    }
}

function showStandardUtilitiesAllowance () {
    var utilityAllowance = document.getElementById('utility_allowance_question');
    var actualUtilitiesCosts = document.getElementById('actual_utilities_costs_question');

    if (utilityAllowance && actualUtilitiesCosts) {
        if (utilityAllowance.classList.contains('hidden')) {
            utilityAllowance.classList.remove('hidden');
        }

        if (!actualUtilitiesCosts.classList.contains('hidden')) {
            actualUtilitiesCosts.classList.add('hidden');
        }
    }
}

function responseToHTML (response) {
    if (response.status !== 'OK') {
      html = '<h1>Error(s):</h1>';
      errors = response.errors;

      for (var i = 0; i < errors.length; i++) {
          var error = errors[i];
          html += ('<li style="color: red;">' + error + '.</li>')
      }

      return html;
    }

    html = '<h1>Results:</h1>';

    if (response.eligible) {
        html += '<div class="result-headline">You may be <b>eligible</b> for SNAP benefits.</div>';
        html += '<div class="result-headline">Your benefit could be as much as $' + response.estimated_monthly_benefit + ' per month.</div>';
        html += '<div class="result-headline">Apply here: <a href="' + response.state_website + '">' + response.state_website + '</a>.</div>';
    } else {
        html += '<div class="result-headline">You may not be eligible for SNAP benefits.</div>'
    }

    html += '<br/><a class="result-headline why" id="why" onclick="toggleReasons()">Why did I get these results?</a>';

    html += '<div id="reasons" class="hidden">';

    var eligibility_factors = response.eligibility_factors;
    eligibility_factors.sort(function(a, b) {
        return a.sort_order - b.sort_order;
    });

    for (var i = 0; i < eligibility_factors.length; i++) {
        var eligibility_factor = eligibility_factors[i];
        name = eligibility_factor.name
        explanation = eligibility_factor.explanation

        html += ('<h3>' + name + ':</h3>')

        html += '<div>';
        for (var j = 0; j < explanation.length; j++) {
            var explanation_graph = explanation[j];
            html += ('<p>' + explanation_graph + '</p>')
        }
        html += '</div>';
    }
    html += '</div>';

    return html;
}

function sendData() {
    var XHR = new XMLHttpRequest();

    // Define what happens on successful data submission.
    XHR.addEventListener("load", function(event) {
        // Convert JSON response to HTML
        response = JSON.parse(event.target.responseText);
        resultHTML = responseToHTML(response);
        var results = document.getElementById('results');
        results.innerHTML = resultHTML;

        // Scroll to top if the results are displayed next to the form, as opposed to below the form.
        // Otherwise, scroll to bottom to put results into view.
        // 640px is the tablet breakpoint in USWDS Grid system: https://designsystem.digital.gov/utilities/layout-grid/
        var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

        if (width >= 640) {
            window.scrollTo(0, 0);
        } else {
            // Source: https://stackoverflow.com/questions/11715646/scroll-automatically-to-the-bottom-of-the-page
            var scrollingElement = (document.scrollingElement || document.body);
            scrollingElement.scrollTop = scrollingElement.scrollHeight;
        }
    });

    // Define what happens in case of error.
    XHR.addEventListener("error", function( event ) {
      console.log('Oops! Something went wrong.');
    });

    // Set up our request.
    XHR.open("POST", "/calculate");
    XHR.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    // Send form data as JSON.
    var formData = new FormData(form);
    var jsonData = {};
    formData.forEach(function(value, key) {
        jsonData[key] = value;
    });
    var json = JSON.stringify(jsonData);

    XHR.send(json);
}

var form = document.getElementById('prescreener-form');

form.addEventListener('submit', function (event) {
    event.preventDefault();
    sendData();
});

var elderlyOrDisabledTrue = document.getElementById('input__household_includes_elderly_or_disabled_true');
var elderlyOrDisabledFalse = document.getElementById('input__household_includes_elderly_or_disabled_false');

elderlyOrDisabledTrue.addEventListener('change', function (event) {
    showMedicalExpensesForElderlyOrDisabled();
});

elderlyOrDisabledFalse.addEventListener('change', function (event) {
    hideMedicalExpensesForElderlyOrDisabled();
});

var stateOrTerritory = document.getElementById('state_or_territory');

stateOrTerritory.addEventListener('change', function (event) {
    var stateOrTerritoryAbbr = event.target.value;

    if (['VA', 'AK', 'HI', 'TN'].indexOf(stateOrTerritoryAbbr) > -1) {
        showActualUtilitiesCosts();
    } else {
        showStandardUtilitiesAllowance();
    }
});
