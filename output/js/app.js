$(function() {
    // Constants.
    const stateIndex = 0;
    const stageIdIndex = 1;
    const valuesIndex = 2;

    // UI elements.
    const valueMeaning = $('#value-meaning');
    const valuePreview = $('#value-preview');
    const frameIndex = $('#frame-index');
    const watchTable = $('#watch-table');

    // State.
    let currentFrame = 0;
    let watchList = new Set();

    function getValue(id) {
        const valueId = window.frames[currentFrame][valuesIndex][id];
        let value = window.values[valueId];
        if (!value) {
            value = 'No value';
        }
        return value;
    }

    function clearValuePreview() {
        valueMeaning.text('');
        valuePreview.text('');
    }

    function displayValuePreview() {
        const meaning = $(this).data('meaning');
        valueMeaning.text(meaning);

        const id = $(this).data('id');
        const value = getValue(id);
        valuePreview.text(value);
    }

    function addToWatchList() {
        const id = $(this).data('id');
        if (watchList.has(id)) {
            return;
        }
        watchList.add(id);

        const expr = $('<pre/>').append($(this).html());
        const value = $('<pre/>').attr('id', 'watch' + id);
        const row = $('<tr/>')
            .append($('<td/>').append(expr))
            .append($('<td/>').append(value));

        watchTable.append(row);
        updateWatchListValues();
    }

    function updateWatchListValues() {
        for (let id of watchList) {
            const value = getValue(id);
            $('#watch' + id).html(value);
        }
    }

    $('.slot').hover(displayValuePreview, clearValuePreview);
    $('.expr').hover(displayValuePreview, clearValuePreview);

    $('.slot').click(addToWatchList);
    $('.expr').click(addToWatchList);

    function updateAfterFrameChange() {
        frameIndex.text((currentFrame + 1).toString());
        $('.stage').removeClass(['stage-advanced', 'stage-eof']);

        const isAdvanced = window.frames[currentFrame][stateIndex];
        const stageId = window.frames[currentFrame][stageIdIndex];
        const className = isAdvanced ? 'stage-advanced' : 'stage-eof';
        $('#id' + stageId).addClass(className);

        updateWatchListValues();
    }

    $('#prev-frame').click(function() {
        currentFrame--;
        if (currentFrame < 0) {
            currentFrame = window.frames.length - 1;
        }
        updateAfterFrameChange();
    });

    $('#next-frame').click(function() {
        currentFrame++;
        if (currentFrame >= window.frames.length) {
            currentFrame = 0;
        }
        updateAfterFrameChange();
    });

    // Set initial state of the UI.
    updateAfterFrameChange();
});