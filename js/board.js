import ai from './ai.js';
import deck from './deck.js';
import game from './game.js';

export default {
    zIndex: 0, // z-index of a card

    /**
     * Display valid set, then move it away and update points
     * @param  {array}  set    IDs of 3 cards
     * @param  {string} winner 'bot' or 'user'
     */
    validSet(set, winner) {
        // Disable add-three-button
        $('button.secondary').attr('disabled', true);

        // Display valid set
        this.showValidSet(set);

        setTimeout(() => {
            // Move set away
            this.moveSetAway(set, winner);

            // Increment points
            game.updatePoints(1, winner);

            setTimeout(() => {
                $('main').removeClass('waiting');

                if (deck.shown.length === 9) {
                    // Add a new set
                    deck.draw3Cards();
                } else if (deck.shown.length > 9) {
                    // Reorganize displayed cards
                    this.reorganizeCards();
                }

                setTimeout(() => {
                    // User can play again
                    $('button.main').html('Set<span>or press Space</span>').removeAttr('disabled');

                    // Launch bot tests again
                    ai.foundSet = false;
                    ai.test = 0;
                    ai.solve();
                }, 2000);
            }, 500);
        }, 2000);
    },

    /**
     * Show a valid set
     * @param  {array} set IDs of 3 cards
     */
    showValidSet(set) {
        $('main').addClass('set');

        for (let id of set) $(`.card#${id}`).addClass('set locked');
    },

    /**
     * Move a valid set away (to either bot or user)
     * @param  {array}  set    IDs of 3 cards
     * @param  {string} winner 'bot' or 'user'
     */
    moveSetAway(set, winner) {
        deck.show -= 3;

        let delay = 0;

        for (let id of set) {
            setTimeout(() => {
                // Remove card from currently-displayed array
                deck.removeCurrentByID(id);

                // Move card away
                this.moveCardAway(id, winner);
            }, delay * 200);
            delay += 1;
        }
    },

    /**
     * Move a card away
     * @param  {int}    id     card ID
     * @param  {string} winner 'bot' or 'user'
     */
    moveCardAway(id, winner) {
        $('main').removeClass('set');

        const $card = $(`.card#${id}`);

        // Save emptied positions for new set to appear
        deck.emptyPos.push(parseInt($card.attr('data-pos')));

        // Move cards
        $card.removeClass('selected set').attr('data-pos', winner).css({
            left: $(`.${winner} .sets-wrapper`).offset().left,
            top: $(`.${winner} .sets-wrapper`).offset().top - 4,
            zIndex: this.zIndex++
        });
    },

    /**
     * Reorganize cards on the table
     */
    reorganizeCards() {
        // Move card to left if possible
        for (const card of $('.card:not(.locked)').toArray()) {
            const $card = $(card);
            const pos = parseInt($card.attr('data-pos'));

            let newPos = pos;
            while (newPos - 3 > 0) {
                if ($(`.card[data-pos="${newPos - 3}"]`).is(':not(.locked)')) break;
                newPos -= 3;
            }

            $card.attr('data-pos', newPos);
            deck.updateCardPos($card, newPos);
        }

        // Fill remaining empty spots
        for (const card of $('.card:not(.locked)').toArray()) {
            const $card = $(card);
            const pos = parseInt($card.attr('data-pos'));
            if (pos < 12) continue;

            let newPos = 0;
            for (let i = 0; i < deck.show; i += 1) {
                if (!$(`.card[data-pos="${newPos}"]`).length) break;
                newPos = i;
            }

            $card.attr('data-pos', newPos);
            deck.updateCardPos($card, newPos);
        }
    }
}