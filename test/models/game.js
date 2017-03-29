var should = require('should');
var expect = require('chai').expect;
var app = require('../../app');
var ValidationError = require('../../helpers/ValidationError');

var mongoose = require('mongoose');
var Game = mongoose.model('Game');
var User = mongoose.model('User');


/**
 * Test API key checks
 */
describe('Game.outputForUser()', function() {
    it('should work', async function() {
        // TODO
    });
});

/**
 * Test Game.validateBoard()
 */
describe('Game.validateStartBoard()', function() {
    let board;

    function resetCorrectBoard() {
        board =
            [['7', 'B', '5', '2', '9', '9', '1', '8', '9', 'B'],
             ['B', '7', '9', 'S', '4', '5', '8', '5', '3', '9'],
             ['7', 'B', '4', '8', '6', '4', '3', '8', '7', '6'],
             ['B', 'F', 'B', '5', '9', '6', '6', '9', '9', '8']];
    }

    beforeEach(async function() {
        resetCorrectBoard();
    });

    it('should validate a correct start board', async function() {
        Game.validateStartBoard.bind(Game, board).should.not.throw(ValidationError);
    });

    it('should only accept 4x10 string arrays', async function() {
        Game.validateStartBoard.bind(Game, '').should.throw(ValidationError);
        Game.validateStartBoard.bind(Game, true).should.throw(ValidationError);
        Game.validateStartBoard.bind(Game, []).should.throw(ValidationError);
        Game.validateStartBoard.bind(Game, [1, 2, 3, 4]).should.throw(ValidationError);

        board[0][0] = true;
        Game.validateStartBoard.bind(Game, board).should.throw(ValidationError);
    });

    it('should only accept valid piece codes', async function() {

        board[2][7] = '7 ';
        Game.validateStartBoard.bind(Game, board).should.throw(ValidationError);

        resetCorrectBoard();
        board[1][2] = 'P';
        Game.validateStartBoard.bind(Game, board).should.throw(ValidationError);
    });

    it('should only accept a correct number of pieces per board', async function() {
        board[0][0] = 'B'; /// Extra flag
        Game.validateStartBoard.bind(Game, board).should.throw(ValidationError);

        resetCorrectBoard();
        board[3][1] = '1' // Overwrite flag
        Game.validateStartBoard.bind(Game, board).should.throw(ValidationError);

        // Swap two pieces
        resetCorrectBoard();
        var swap = board[0][0];
        board[0][0] = board[0][1];
        board[0][1] = swap;
        Game.validateStartBoard.bind(Game, board).should.not.throw(ValidationError);

    });
});

/**
 * Test Game.setUpStartBoard()
 */
describe('Game.setUpStartBoard()', function() {
    let test_user, game;
    let board = [['7', 'B', '5', '2', '9', '9', '1', '8', '9', 'B'],
                 ['B', '7', '9', 'S', '4', '5', '8', '5', '3', '9'],
                 ['7', 'B', '4', '8', '6', '4', '3', '8', '7', '6'],
                 ['B', 'F', 'B', '5', '9', '6', '6', '9', '9', '8']];

    beforeEach(async () => {
        await User.remove({});
        await Game.remove({});

        test_user = new User();
        test_user._id = 'test_user_id';
        test_user.api_key = 'a';
        test_user.name = 'a';
        test_user = await test_user.save();

        game = new Game();
        game.player1 = test_user;
        game.player2 = 'someone_else';
        game.state = 'waiting_for_pieces';
        game = await game.save();
    });

    it('should accept a board and save it', async function() {
        game.setUpStartBoard(test_user, board);
        expect(game.player1_set_up_pieces).to.be.true;
        expect(game.player2_set_up_pieces).to.be.false;
        expect(game.state).to.equal(Game.STATE.WAITING_FOR_PIECES);

        expect(JSON.stringify(game.board)).to.equal(JSON.stringify([
            [' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' '],
            [' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' '],
            [' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' '],
            [' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' '],
            [' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' '],
            [' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' '],
            ['1:7', '1:B', '1:5', '1:2', '1:9', '1:9', '1:1', '1:8', '1:9', '1:B'],
            ['1:B', '1:7', '1:9', '1:S', '1:4', '1:5', '1:8', '1:5', '1:3', '1:9'],
            ['1:7', '1:B', '1:4', '1:8', '1:6', '1:4', '1:3', '1:8', '1:7', '1:6'],
            ['1:B', '1:F', '1:B', '1:5', '1:9', '1:6', '1:6', '1:9', '1:9', '1:8']]));
    });

    it('should accept a board as player 2 and save it', async function() {
        game.player1 = 'someone_else';
        game.player2 = test_user;

        game.setUpStartBoard('someone_else', board);
        game.setUpStartBoard(test_user, board);

        expect(game.player2_set_up_pieces).to.be.true;

        expect(JSON.stringify(game.board)).to.equal(JSON.stringify([
            ['2:8', '2:9', '2:9', '2:6', '2:6', '2:9', '2:5', '2:B', '2:F', '2:B'],
            ['2:6', '2:7', '2:8', '2:3', '2:4', '2:6', '2:8', '2:4', '2:B', '2:7'],
            ['2:9', '2:3', '2:5', '2:8', '2:5', '2:4', '2:S', '2:9', '2:7', '2:B'],
            ['2:B', '2:9', '2:8', '2:1', '2:9', '2:9', '2:2', '2:5', '2:B', '2:7'],
            [' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' '  ],
            [' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' ',   ' '  ],
            ['1:7', '1:B', '1:5', '1:2', '1:9', '1:9', '1:1', '1:8', '1:9', '1:B'],
            ['1:B', '1:7', '1:9', '1:S', '1:4', '1:5', '1:8', '1:5', '1:3', '1:9'],
            ['1:7', '1:B', '1:4', '1:8', '1:6', '1:4', '1:3', '1:8', '1:7', '1:6'],
            ['1:B', '1:F', '1:B', '1:5', '1:9', '1:6', '1:6', '1:9', '1:9', '1:8']]));
    });

    it('should give an error if the user doesn\'t participate', async function() {
        game.player1 = 'some_guy';
        game.setUpStartBoard.bind(game, test_user, board).should.throw(ValidationError);
    });

    it('should give an error if the game isn\'t in the state waiting_for_pieces', async function() {
        game.state = 'started';
        game.setUpStartBoard.bind(game, test_user, board).should.throw(ValidationError);

        game.state = 'waiting_for_an_opponent';
        game.setUpStartBoard.bind(game, test_user, board).should.throw(ValidationError);
    });

    it('should give an error if the user already set up the board', async () => {
        game.player1_set_up_pieces = true;
        game.setUpStartBoard.bind(game, test_user, board).should.throw(ValidationError);
    });

    it('should give an error if the user (as player 2) already set up the board', async () => {
        game.player1 = 'someone_else';
        game.player2 = test_user;
        game.player1_set_up_pieces = false;
        game.player2_set_up_pieces = true;
        game.setUpStartBoard.bind(game, test_user, board).should.throw(ValidationError);
    });
});