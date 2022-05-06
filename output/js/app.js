$(function() {
    // Constants.
    const stateIndex = 0;
    const stageIdIndex = 1;
    const valuesIndex = 2;

    // UI elements.
    const valueMeaning = $('#value-meaning');
    const valuePreview = $('#value-preview');
    const frameIndex = $('#frame-index');

    // State.
    let currentFrame = 0;

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

    $('.slot').hover(displayValuePreview, clearValuePreview);
    $('.expr').hover(displayValuePreview, clearValuePreview);

    function updateAfterFrameChange() {
        frameIndex.text((currentFrame + 1).toString());
        $('.stage').removeClass(['stage-advanced', 'stage-eof']);

        const isAdvanced = window.frames[currentFrame][stateIndex];
        const stageId = window.frames[currentFrame][stageIdIndex];
        const className = isAdvanced ? 'stage-advanced' : 'stage-eof';
        $('#id' + stageId).addClass(className);
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