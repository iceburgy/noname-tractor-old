import { MainForm } from './main_form.js';
import { CurrentPoker } from './current_poker.js';
import { CommonMethods } from './common_methods.js';
import { SuitEnums } from './suit_enums.js';
import { TractorRules } from './tractor_rules.js';
import { ShowingCardsValidationResult } from './showing_cards_validation_result.js';
import { PokerHelper } from './poker_helper.js';
import { TrumpState } from './trump_state.js';
import { EmojiUtil } from './emoji_util.js';

const CardsReady_REQUEST = "CardsReady"
declare let decadeUI: any;

export class DrawingFormHelper {
    public mainForm: MainForm;

    private startX: string = "";
    private startY: string = "";
    private handcardScale: number = 1;
    private handcardPosition: number = 1;
    private suitSequence: number;
    public isDragging: any;
    public isMouseDown: boolean = false;
    public skipCheckCardImages: boolean = false;

    constructor(mf: MainForm) {
        this.mainForm = mf
        this.suitSequence = 0
    }

    public IGetCard(cardNumber: number) {
        this.skipCheckCardImages = true;
        // this.destroyAllCards()
        this.resetAllCards();
        this.DrawHandCardsByPosition(1, this.mainForm.tractorPlayer.CurrentPoker, 1, SuitEnums.Suit.Joker);

        let skipDestroy = (cardNumber !== 53 || this.mainForm.tractorPlayer.CurrentPoker.RedJoker() !== 2);
        this.reDrawToolbar(skipDestroy);
    }

    // drawing cards without any tilt
    public ResortMyHandCards(destroy?: boolean) {
        this.skipCheckCardImages = false;
        if (this.mainForm.tractorPlayer.CurrentPoker.Count() === TractorRules.GetCardNumberofEachPlayer(this.mainForm.tractorPlayer.CurrentGameState.Players.length) + 8) {
            this.skipCheckCardImages = true;
        }
        this.mainForm.myCardIsReady = Array(33).fill(false);
        if (destroy) {
            this.destroyAllCards();
        }
        else {
            this.resetAllCards();
        }
        this.DrawHandCardsByPosition(1, this.mainForm.tractorPlayer.CurrentPoker, 1)
    }

    // drawing cards with selected cards tilted
    public DrawMyPlayingCards() {
        this.skipCheckCardImages = true;
        this.DrawScoreImageAndCards()
        // this.destroyAllCards()
        this.resetAllCards();
        this.DrawHandCardsByPosition(1, this.mainForm.tractorPlayer.CurrentPoker, 1)

        this.validateSelectedCards()
    }
    public validateSelectedCards() {
        if (this.mainForm.tractorPlayer.isObserver) return
        this.mainForm.SelectedCards = []
        for (let k = 0; k < this.mainForm.myCardIsReady.length; k++) {
            if (this.mainForm.myCardIsReady[k]) {
                this.mainForm.SelectedCards.push(parseInt(this.mainForm.gameScene.cardImages[k].getAttribute("serverCardNumber")));
            }
        }

        //判断当前的出的牌是否有效,如果有效，画小猪
        if (this.mainForm.SelectedCards.length > 0) {
            var selectedCardsValidationResult = TractorRules.IsValid(this.mainForm.tractorPlayer.CurrentTrickState,
                this.mainForm.SelectedCards,
                this.mainForm.tractorPlayer.CurrentPoker);

            if ((this.mainForm.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.Playing
                && this.mainForm.tractorPlayer.CurrentTrickState.NextPlayer() == this.mainForm.tractorPlayer.PlayerId)
                &&
                (selectedCardsValidationResult.ResultType == ShowingCardsValidationResult.ShowingCardsValidationResultType.Valid ||
                    selectedCardsValidationResult.ResultType == ShowingCardsValidationResult.ShowingCardsValidationResultType.TryToDump)) {
                if (this.mainForm.gameScene.ui.btnPig && !this.mainForm.gameScene.ui.btnPig.classList.contains('hidden')) {
                    this.mainForm.gameScene.ui.btnPig.classList.remove('disabled');
                    this.mainForm.gameScene.ui.btnPig.classList.add('pointerdiv');
                }
            }
            else if ((this.mainForm.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.Playing
                && this.mainForm.tractorPlayer.CurrentTrickState.NextPlayer() == this.mainForm.tractorPlayer.PlayerId)) {
                this.mainForm.gameScene.ui.btnPig.classList.add('disabled');
                this.mainForm.gameScene.ui.btnPig.classList.remove('pointerdiv');
            }

        }
        else if ((this.mainForm.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.Playing
            && this.mainForm.tractorPlayer.CurrentTrickState.NextPlayer() == this.mainForm.tractorPlayer.PlayerId)) {
            this.mainForm.gameScene.ui.btnPig.classList.add('disabled');
            this.mainForm.gameScene.ui.btnPig.classList.remove('pointerdiv');
        }


        this.My8CardsIsReady();

    }

    private My8CardsIsReady() {
        if (this.mainForm.tractorPlayer.isObserver) return;
        //如果等我扣牌
        if (this.mainForm.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.DiscardingLast8Cards && this.mainForm.tractorPlayer.CurrentHandState.Last8Holder == this.mainForm.tractorPlayer.PlayerId) {
            let total = 0;
            for (let i = 0; i < this.mainForm.myCardIsReady.length; i++) {
                if (this.mainForm.myCardIsReady[i]) {
                    total++;
                }
            }
            if (total == 8) {
                this.mainForm.gameScene.ui.btnPig.classList.remove('disabled')
                this.mainForm.gameScene.ui.btnPig.classList.add('pointerdiv');
            }
            else {
                this.mainForm.gameScene.ui.btnPig.classList.add('disabled')
                this.mainForm.gameScene.ui.btnPig.classList.remove('pointerdiv');
            }
        }
    }

    // playerPos: 1-4
    public DrawHandCardsByPosition(playerPos: number, currentPoker: CurrentPoker, hcs: number, curTrump?: number) {
        this.handcardPosition = playerPos;
        let cardCount: number = currentPoker.Count()

        this.handcardScale = hcs;
        let posIndex = playerPos - 1;
        this.startX = this.mainForm.gameScene.coordinates.handCardPositions[posIndex].x;
        let numOfSuits = CommonMethods.getNumOfSuits(currentPoker);
        if (posIndex == 0) {
            this.startX = `${this.startX} - ${this.mainForm.gameScene.coordinates.handCardOffset * this.handcardScale / 2 * (cardCount - 1)}px - ${(numOfSuits - 1) * this.mainForm.gameScene.coordinates.handCardOffset * this.handcardScale / 2}px`;
        } else if (posIndex == 1 || posIndex == 2) {
            this.startX = `${this.startX} + ${(this.mainForm.gameScene.coordinates.handCardOffset * this.handcardScale * (cardCount - 1) + (numOfSuits - 1) * this.mainForm.gameScene.coordinates.handCardOffset * this.handcardScale)}px`;
        }

        this.startY = this.mainForm.gameScene.coordinates.handCardPositions[posIndex].y
        var allHeartsNoRank: number[] = currentPoker.HeartsNoRank()
        var allSpadesNoRank: number[] = currentPoker.SpadesNoRank()
        var allDiamondsNoRank: number[] = currentPoker.DiamondsNoRank()
        var allClubsNoRank: number[] = currentPoker.ClubsNoRank()

        if (!curTrump) curTrump = this.mainForm.tractorPlayer.CurrentHandState.Trump;
        var subSolidMasters: number[] = []
        if (curTrump != SuitEnums.Suit.Heart) subSolidMasters[currentPoker.Rank] = currentPoker.HeartsRankTotal()
        if (curTrump != SuitEnums.Suit.Spade) subSolidMasters[currentPoker.Rank + 13] = currentPoker.SpadesRankTotal()
        if (curTrump != SuitEnums.Suit.Diamond) subSolidMasters[currentPoker.Rank + 26] = currentPoker.DiamondsRankTotal()
        if (curTrump != SuitEnums.Suit.Club) subSolidMasters[currentPoker.Rank + 39] = currentPoker.ClubsRankTotal()

        let didDrawMaster = false
        var primeSolidMasters: number[] = []
        if (curTrump == SuitEnums.Suit.Heart) {//红桃
            this.DrawCardsBySuit(allSpadesNoRank, 13, true)
            this.DrawCardsBySuit(allDiamondsNoRank, 26, true)
            this.DrawCardsBySuit(allClubsNoRank, 39, true)
            if (this.DrawCardsBySuit(allHeartsNoRank, 0, true)) {
                if (this.handcardPosition === 2 || this.handcardPosition === 3) {
                    this.startX = `${this.startX} + ${this.mainForm.gameScene.coordinates.handCardOffset * this.handcardScale}px`;
                }
                else {
                    this.startX = `${this.startX} - ${this.mainForm.gameScene.coordinates.handCardOffset * this.handcardScale}px`;
                }
                didDrawMaster = true;
            }

            primeSolidMasters[currentPoker.Rank] = currentPoker.HeartsRankTotal()
        } else if (curTrump == SuitEnums.Suit.Spade) {//黑桃
            this.DrawCardsBySuit(allDiamondsNoRank, 26, true)
            this.DrawCardsBySuit(allClubsNoRank, 39, true)
            this.DrawCardsBySuit(allHeartsNoRank, 0, true)
            if (this.DrawCardsBySuit(allSpadesNoRank, 13, true)) {
                if (this.handcardPosition === 2 || this.handcardPosition === 3) {
                    this.startX = `${this.startX} + ${this.mainForm.gameScene.coordinates.handCardOffset * this.handcardScale}px`;
                }
                else {
                    this.startX = `${this.startX} - ${this.mainForm.gameScene.coordinates.handCardOffset * this.handcardScale}px`;
                }
                didDrawMaster = true
            }

            primeSolidMasters[currentPoker.Rank + 13] = currentPoker.SpadesRankTotal()
        } else if (curTrump == SuitEnums.Suit.Diamond) {//方片
            this.DrawCardsBySuit(allClubsNoRank, 39, true)
            this.DrawCardsBySuit(allHeartsNoRank, 0, true)
            this.DrawCardsBySuit(allSpadesNoRank, 13, true)
            if (this.DrawCardsBySuit(allDiamondsNoRank, 26, true)) {
                if (this.handcardPosition === 2 || this.handcardPosition === 3) {
                    this.startX = `${this.startX} + ${this.mainForm.gameScene.coordinates.handCardOffset * this.handcardScale}px`;
                }
                else {
                    this.startX = `${this.startX} - ${this.mainForm.gameScene.coordinates.handCardOffset * this.handcardScale}px`;
                }
                didDrawMaster = true
            }

            primeSolidMasters[currentPoker.Rank + 26] = currentPoker.DiamondsRankTotal()
        } else if (curTrump == SuitEnums.Suit.Club) {//草花
            this.DrawCardsBySuit(allHeartsNoRank, 0, true)
            this.DrawCardsBySuit(allSpadesNoRank, 13, true)
            this.DrawCardsBySuit(allDiamondsNoRank, 26, true)
            if (this.DrawCardsBySuit(allClubsNoRank, 39, true)) {
                if (this.handcardPosition === 2 || this.handcardPosition === 3) {
                    this.startX = `${this.startX} + ${this.mainForm.gameScene.coordinates.handCardOffset * this.handcardScale}px`;
                }
                else {
                    this.startX = `${this.startX} - ${this.mainForm.gameScene.coordinates.handCardOffset * this.handcardScale}px`;
                }
                didDrawMaster = true
            }

            primeSolidMasters[currentPoker.Rank + 39] = currentPoker.ClubsRankTotal()
        } else {//无主
            this.DrawCardsBySuit(allHeartsNoRank, 0, true)
            this.DrawCardsBySuit(allSpadesNoRank, 13, true)
            this.DrawCardsBySuit(allDiamondsNoRank, 26, true)
            this.DrawCardsBySuit(allClubsNoRank, 39, true)
        }

        primeSolidMasters[52] = currentPoker.Cards[52]
        primeSolidMasters[53] = currentPoker.Cards[53]
        if (this.DrawCardsBySuit(subSolidMasters, 0, !didDrawMaster)) {
            if (this.handcardPosition === 2 || this.handcardPosition === 3) {
                this.startX = `${this.startX} + ${this.mainForm.gameScene.coordinates.handCardOffset * this.handcardScale}px`;
            }
            else {
                this.startX = `${this.startX} - ${this.mainForm.gameScene.coordinates.handCardOffset * this.handcardScale}px`;
            }
            didDrawMaster = true
        }
        this.DrawCardsBySuit(primeSolidMasters, 0, !didDrawMaster)
    }

    private DrawCardsBySuit(cardsToDraw: number[], offset: number, resetSuitSequence: boolean): boolean {
        if (resetSuitSequence) this.suitSequence = 1;
        let hasDrawn = false;
        for (let i = 0; i < cardsToDraw.length; i++) {
            var cardCount: number = cardsToDraw[i]
            for (let j = 0; j < cardCount; j++) {
                this.drawCard(this.startX, this.startY, i + offset)
                if (this.handcardPosition === 2 || this.handcardPosition === 3) {
                    this.startX = `${this.startX} - ${this.mainForm.gameScene.coordinates.handCardOffset * this.handcardScale}px`;
                }
                else {
                    this.startX = `${this.startX} + ${this.mainForm.gameScene.coordinates.handCardOffset * this.handcardScale}px`;
                }
                hasDrawn = true
            }
        }
        if (hasDrawn) {
            if (this.handcardPosition === 2 || this.handcardPosition === 3) {
                this.startX = `${this.startX} - ${this.mainForm.gameScene.coordinates.handCardOffset * this.handcardScale}px`;
            }
            else {
                this.startX = `${this.startX} + ${this.mainForm.gameScene.coordinates.handCardOffset * this.handcardScale}px`;
            }
        }
        return hasDrawn
    }

    private DrawShowedCards(serverCardList: number[], x: string, y: string, targetImages: any[], scale: number, pos: number, skipXUpdate?: boolean) {
        // 5 - last 8 cards
        // 6 - score cards
        // 7 - DrawTrumpMadeCardsByPositionFromLastTrick for pos 3
        if (pos === 2 || pos === 5 || pos === 7) {
            this.DrawShowedCardsReverse(serverCardList, x, y, targetImages, scale, pos);
            return;
        }
        if (!skipXUpdate && (pos === 1 || pos === 3)) {
            x = `${x} - ${this.mainForm.gameScene.coordinates.handCardOffset * scale * (serverCardList.length - 1) / 2}px`;
        }

        for (let i = 0; i < serverCardList.length; i++) {
            let uiCardNumber = CommonMethods.ServerToUICardMap[serverCardList[i]]
            let image = this.createCard(this.mainForm.gameScene.ui.frameGameRoom, uiCardNumber, scale);
            image.setAttribute('serverCardNumber', serverCardList[i]);

            switch (pos) {
                case 1:
                    image.style.left = `calc(${x})`;
                    image.style.bottom = `calc(${y})`;
                    break;
                case 3:
                case 6:
                    image.style.left = `calc(${x})`;
                    image.style.top = `calc(${y})`;
                    break;
                case 4:
                    image.style.left = `calc(${x})`;
                    image.style.bottom = `calc(${y})`;
                    break;
                default:
                    break;
            }
            targetImages.push(image);
            x = `${x} + ${this.mainForm.gameScene.coordinates.handCardOffset * scale}px`;
        }
    }

    private DrawShowedCardsReverse(serverCardList: number[], x: string, y: string, targetImages: any[], scale: number, pos: number) {
        x = `${x} + ${this.mainForm.gameScene.coordinates.handCardOffset * scale * (serverCardList.length - 1)}px`;
        for (let i = 0; i < serverCardList.length; i++) {
            let uiCardNumber = CommonMethods.ServerToUICardMap[serverCardList[i]]
            let image = this.createCard(this.mainForm.gameScene.ui.frameGameRoom, uiCardNumber, scale);
            image.setAttribute('serverCardNumber', serverCardList[i]);

            switch (pos) {
                case 2:
                    image.style.right = `calc(${x})`;
                    image.style.bottom = `calc(${y})`;
                    break;
                case 5:
                case 7:
                    image.style.right = `calc(${x})`;
                    image.style.top = `calc(${y})`;
                    break;
                default:
                    break;
            }
            targetImages.push(image);
            x = `${x} - ${this.mainForm.gameScene.coordinates.handCardOffset * scale}px`;
        }
    }

    private drawCard(x: string, y: string, serverCardNumber: number,) {
        let image: any = undefined;

        let tempImages: any[] = this.mainForm.gameScene.cardServerNumToImage[serverCardNumber];
        if (tempImages && tempImages.length > 0) {
            for (let i = 0; i < tempImages.length; i++) {
                let tempImage = tempImages[i];
                if (tempImage.classList.contains(CommonMethods.classCardProcessed)) continue;

                image = tempImage;
                break;
            }
        }

        let parent = this.mainForm.gameScene.ui.frameGameRoom;
        if (this.handcardPosition === 1) parent = this.mainForm.gameScene.ui.handZone;
        let isAnimation = false;
        if (!image) {
            // 未在已画牌中，则需画牌
            let uiCardNumber = CommonMethods.ServerToUICardMap[serverCardNumber]
            isAnimation = this.mainForm.tractorPlayer.CurrentHandState.CurrentHandStep === SuitEnums.HandStep.DistributingCards;
            image = this.createCard(parent, uiCardNumber, this.handcardScale, x, y);
            image.setAttribute('cardsOrderNumber', this.mainForm.cardsOrderNumber);
            image.setAttribute('serverCardNumber', serverCardNumber);
            image.node.seqnum.style.position = "absolute";
            image.node.seqnum.style.left = "calc(1px)";
            image.node.seqnum.style.top = "calc(65%)";
            image.node.seqnum.style.fontSize = `${15 * this.handcardScale}px`;
            image.node.seqnum.style.color = 'gray';
            image.node.seqnum.style['font-family'] = 'serif';
            image.node.seqnum.style['text-shadow'] = 'none';

            this.mainForm.gameScene.cardImages.splice(this.mainForm.cardsOrderNumber, 0, image);
            image.classList.add(CommonMethods.classCardProcessed);
            this.mainForm.gameScene.cardServerNumToImage[serverCardNumber].push(image);

            if (this.mainForm.myCardIsReady[this.mainForm.cardsOrderNumber] === undefined) {
                this.mainForm.myCardIsReady[this.mainForm.cardsOrderNumber] = false
            }

            if (!this.mainForm.gameScene.isReplayMode) {
                if (!this.mainForm.tractorPlayer.isObserver) {
                    if (this.mainForm.gameScene.noTouchDevice.toLowerCase() !== "true" && CommonMethods.isTouchDevice()) {
                        // touch device
                        image.node.cover.addEventListener("touchstart", (e: any) => {
                            this.handleSelectingCard(image)
                            this.isMouseDown = true;
                            this.isDragging = image
                        });
                        image.addEventListener("touchend", (e: any) => {
                            this.isMouseDown = false;
                            this.isDragging = undefined
                        });
                        image.node.cover.addEventListener("touchmove", (e: any) => {
                            let coverTouched: any = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY)
                            if (coverTouched && coverTouched.classList.contains('cover')) {
                                let cardTouched: any = coverTouched.parentElement;
                                if (cardTouched.classList.contains('tractorCard')) {
                                    if (this.mainForm.gameScene.yesDragSelect.toLowerCase() === "true" && this.isDragging !== cardTouched && this.isMouseDown) {
                                        this.handleSelectingCard(cardTouched);
                                        this.isDragging = cardTouched;
                                    }
                                }
                            }
                        });
                    }
                    else {
                        // left click
                        image.node.cover.addEventListener("mousedown", (e: any) => {
                            if (e.button === 0) {
                                this.handleSelectingCard(image)
                                this.isMouseDown = true;
                                this.isDragging = image
                            }
                        });
                        image.addEventListener("mouseup", (e: any) => {
                            this.isMouseDown = false;
                            this.isDragging = undefined
                        });
                        image.node.cover.addEventListener("mouseover", (e: any) => {
                            if (this.mainForm.gameScene.yesDragSelect.toLowerCase() === "true" && e.button === 0 && this.isDragging !== image && this.isMouseDown) {
                                this.handleSelectingCard(image);
                            }
                        });

                        // right click
                        image.node.cover.addEventListener("mousedown", (e: any) => {
                            if (e.button === 2) {
                                this.handleSelectingCardRightClick(image)
                            }
                        });
                    }
                }
            }
        }

        var trumpMadeCard = (this.mainForm.tractorPlayer.CurrentHandState.Trump - 1) * 13 + this.mainForm.tractorPlayer.CurrentHandState.Rank;
        switch (this.handcardPosition) {
            case 1:
                if (!isAnimation || this.mainForm.gameScene.isReplayMode) {
                    image.style.left = `calc(${x})`;
                    image.style.bottom = `calc(${y})`;
                    image.style.opacity = 1;
                }
                break;
            case 2:
                image.style.right = `calc(${x})`;
                image.style.bottom = `calc(${y})`;
                break;
            case 3:
                image.style.right = `calc(${x})`;
                image.style.top = `calc(${y})`;
                break;
            case 4:
                image.style.left = `calc(${x})`;
                image.style.bottom = `calc(${y})`;
                break;
            default:
                break;
        }

        if (!this.skipCheckCardImages) {
            let prevOrderNum = parseInt(image.getAttribute('cardsOrderNumber'));
            if (prevOrderNum !== this.mainForm.cardsOrderNumber) {
                if (this.mainForm.gameScene.cardImages[prevOrderNum]) {
                    this.swapCardImage(prevOrderNum, this.mainForm.cardsOrderNumber);
                    if (parent === this.mainForm.gameScene.ui.handZone && parent.childNodes.length > this.mainForm.cardsOrderNumber) {
                        parent.insertBefore(image, parent.childNodes[this.mainForm.cardsOrderNumber]);
                    } else {
                        parent.appendChild(image);
                    }
                }
            }
        }
        image.setAttribute('cardsOrderNumber', this.mainForm.cardsOrderNumber);

        image.node.seqnum.innerHTML = `${this.suitSequence}`;
        image.classList.add(CommonMethods.classCardProcessed);

        this.suitSequence++
        if (this.mainForm.gameScene.isReplayMode) {
            this.mainForm.cardsOrderNumber++
            return;
        }

        // if I made trump, move it up by 30px
        if (this.mainForm.tractorPlayer.CurrentHandState.TrumpExposingPoker == SuitEnums.TrumpExposingPoker.PairBlackJoker)
            trumpMadeCard = 52;
        else if (this.mainForm.tractorPlayer.CurrentHandState.TrumpExposingPoker == SuitEnums.TrumpExposingPoker.PairRedJoker)
            trumpMadeCard = 53;
        if (this.mainForm.tractorPlayer.CurrentHandState.TrumpMaker == this.mainForm.tractorPlayer.PlayerId &&
            trumpMadeCard == serverCardNumber &&
            (this.mainForm.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.DistributingCards || this.mainForm.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.DistributingCardsFinished)) {
            if (this.mainForm.tractorPlayer.CurrentHandState.TrumpExposingPoker > SuitEnums.TrumpExposingPoker.SingleRank) {
                image.style.transform = `translate(0px, -${CommonMethods.cardTiltHeight}px)`;
                image.setAttribute('status', "up");
            } else {
                let lifted: boolean = false
                for (let i = 0; i < this.mainForm.gameScene.cardImages.length; i++) {
                    if ((this.mainForm.gameScene.cardImages[i] as any).getAttribute('status') === 'up') {
                        lifted = true
                        break
                    }
                }
                if (!lifted) {
                    image.style.transform = `translate(0px, -${CommonMethods.cardTiltHeight}px)`;
                    image.setAttribute('status', "up");
                }
            }
        }
        if (this.mainForm.tractorPlayer.CurrentHandState.TrumpMaker == this.mainForm.tractorPlayer.PlayerId &&
            trumpMadeCard == serverCardNumber &&
            this.mainForm.tractorPlayer.CurrentHandState.CurrentHandStep > SuitEnums.HandStep.DistributingCardsFinished) {
            image.setAttribute("status", "down");
            image.style.transform = 'unset';
        }

        if ((this.mainForm.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.DiscardingLast8Cards || this.mainForm.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.Playing) &&
            this.mainForm.myCardIsReady[this.mainForm.cardsOrderNumber] &&
            (image.data === null || !image.getAttribute('status') || image.getAttribute('status') === "down")) {
            image.style.transform = `translate(0px, -${CommonMethods.cardTiltHeight}px)`;
            image.setAttribute('status', "up");
        }
        if ((this.mainForm.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.DiscardingLast8Cards || this.mainForm.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.Playing) &&
            !this.mainForm.myCardIsReady[this.mainForm.cardsOrderNumber] &&
            (image.data !== null && image.getAttribute('status') && image.getAttribute('status') === "up")) {
            image.setAttribute("status", "down");
            image.style.transform = 'unset';
        }
        this.mainForm.cardsOrderNumber++
    }
    private swapCardImage(prevOrderNum: number, curOrderNum: number) {
        let prevImg = this.mainForm.gameScene.cardImages[prevOrderNum];
        let curImg = this.mainForm.gameScene.cardImages[curOrderNum];
        this.mainForm.gameScene.cardImages[prevOrderNum] = curImg;
        this.mainForm.gameScene.cardImages[curOrderNum] = prevImg;
        prevImg.setAttribute('cardsOrderNumber', curOrderNum);
        curImg.setAttribute('cardsOrderNumber', prevOrderNum);
    }

    public removeCardImage(serverCardNumbers: number[]) {
        // 是出牌，则需删除牌
        let indicesToRemove: number[] = [];
        for (let i = 0; i < serverCardNumbers.length; i++) {
            let serverCardNumber = serverCardNumbers[i];
            let removedCardImageIndex: number = -1;
            for (let i = 0; i < this.mainForm.gameScene.cardServerNumToImage[serverCardNumber].length; i++) {
                let tempImage = this.mainForm.gameScene.cardServerNumToImage[serverCardNumber][i];
                if (tempImage.getAttribute('status') === 'up' ||
                    (this.mainForm.tractorPlayer.playerLocalCache.isLastTrick || this.mainForm.IsDebug) && !this.mainForm.tractorPlayer.isObserver) {
                    removedCardImageIndex = i;
                    break;
                }
            }
            let removedCardImage: any;
            switch (removedCardImageIndex) {
                case 1:
                    removedCardImage = this.mainForm.gameScene.cardServerNumToImage[serverCardNumber].pop();
                    break;
                default:
                    removedCardImage = this.mainForm.gameScene.cardServerNumToImage[serverCardNumber].shift();
                    break;
            }
            if (removedCardImage) {
                let cardsOrderNumber: number = parseInt(removedCardImage.getAttribute('cardsOrderNumber'));
                indicesToRemove.push(cardsOrderNumber);
                removedCardImage.remove();
            }
        }

        let newCIs: any[] = [];
        for (let i = 0; i < this.mainForm.gameScene.cardImages.length; i++) {
            if (indicesToRemove.includes(i)) continue;
            newCIs.push(this.mainForm.gameScene.cardImages[i]);
        }

        this.mainForm.gameScene.cardImages = newCIs;
    }

    private createCard(position: any, uiCardNumber: number, hcs: number, x?: string, y?: string): any {
        var tractorCard = this.mainForm.gameScene.ui.create.div('.tractorCard');
        if (position === this.mainForm.gameScene.ui.handZone && position.childNodes.length > this.mainForm.cardsOrderNumber) {
            position.insertBefore(tractorCard, position.childNodes[this.mainForm.cardsOrderNumber]);
        } else {
            position.appendChild(tractorCard);
        }

        if (position === this.mainForm.gameScene.ui.handZone && x !== undefined && y !== undefined) {
            tractorCard.style.left = `calc(${x})`;
            tractorCard.style.bottom = `calc(${CommonMethods.cardTiltHeight}px)`;
            tractorCard.style.opacity = 0.1;

            setTimeout(() => {
                tractorCard.style.left = `calc(${x})`;
                tractorCard.style.bottom = `calc(${y})`;
                tractorCard.style.opacity = 1;
            }, 100);
        }

        tractorCard.node = {
            seqnum: this.mainForm.gameScene.ui.create.div('.seqnum', tractorCard),
            cover: this.mainForm.gameScene.ui.create.div('.cover', tractorCard),
        }

        let cardsStyle = this.mainForm.gameScene.useCardUIStyleClassic ? "cardsclassic" : "cards";
        if (this.mainForm.gameScene.ui.storageFileForImages.hasOwnProperty(`${cardsStyle}${uiCardNumber}`)) {
            tractorCard.setBackgroundImage(this.mainForm.gameScene.ui.storageFileForImages[`${cardsStyle}${uiCardNumber}`]);
        } else {
            tractorCard.setBackgroundImage(`image/tractor/${cardsStyle}/tile0${uiCardNumber.toString().padStart(2, '0')}.png`);
        }
        tractorCard.style['background-size'] = '100% 100%';
        tractorCard.style['background-repeat'] = 'no-repeat';

        tractorCard.style.width = `${this.mainForm.gameScene.coordinates.cardWidth * hcs}px`;
        tractorCard.style.height = `${this.mainForm.gameScene.coordinates.cardHeight * hcs}px`;

        tractorCard.node.cover.style.width = "100%";
        tractorCard.node.cover.style.height = "100%";

        return tractorCard;
    }

    private handleSelectingCard(image: any) {
        if (!(this.mainForm.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.Playing ||
            this.mainForm.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.DiscardingLast8Cards)) {
            return;
        }
        if (!image || !image.getAttribute("status") || image.getAttribute("status") === "down") {
            image.setAttribute("status", "up");
            image.style.transform = `translate(0px, -${CommonMethods.cardTiltHeight}px)`;
            this.mainForm.myCardIsReady[parseInt(image.getAttribute("cardsOrderNumber"))] = true
            this.mainForm.gameScene.sendMessageToServer(CardsReady_REQUEST, this.mainForm.tractorPlayer.MyOwnId, JSON.stringify(this.mainForm.myCardIsReady));
            this.validateSelectedCards();
        } else {
            image.setAttribute("status", "down");
            image.style.transform = 'unset';
            this.mainForm.myCardIsReady[parseInt(image.getAttribute("cardsOrderNumber"))] = false
            this.mainForm.gameScene.sendMessageToServer(CardsReady_REQUEST, this.mainForm.tractorPlayer.MyOwnId, JSON.stringify(this.mainForm.myCardIsReady));
            this.validateSelectedCards();
        }
    }

    private handleSelectingCardRightClick(image: any) {
        if (!(this.mainForm.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.Playing ||
            this.mainForm.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.DiscardingLast8Cards)) {
            return;
        }
        //统计已选中的牌张数
        let readyCount: number = 0;
        let crlength = this.mainForm.myCardIsReady.length
        for (let ri = 0; ri < crlength; ri++) {
            if (this.mainForm.myCardIsReady[ri]) readyCount++;
        }
        let showingCardsCp = new CurrentPoker();
        showingCardsCp.Trump = this.mainForm.tractorPlayer.CurrentHandState.Trump
        showingCardsCp.Rank = this.mainForm.tractorPlayer.CurrentHandState.Rank;

        let i = parseInt(image.getAttribute("cardsOrderNumber"));
        let b = this.mainForm.myCardIsReady[i];
        this.mainForm.myCardIsReady[i] = !b;
        let clickedCardNumber = parseInt(image.getAttribute("serverCardNumber"));
        let isClickedTrump = PokerHelper.IsTrump(clickedCardNumber, showingCardsCp.Trump, showingCardsCp.Rank);
        //响应右键的3种情况：
        //1. 首出（默认）
        let selectMoreCount = 0;
        for (let left = i - 1; left >= 0; left--) {
            let toAddImage = (this.mainForm.gameScene.cardImages[left] as any)
            let toAddCardNumber = parseInt(toAddImage.getAttribute("serverCardNumber"));

            if (PokerHelper.GetSuit(toAddCardNumber) == PokerHelper.GetSuit(clickedCardNumber) ||
                PokerHelper.IsTrump(toAddCardNumber, showingCardsCp.Trump, showingCardsCp.Rank) && isClickedTrump) selectMoreCount++;
            else break;
        }

        let isDiscardingLast8 = this.mainForm.tractorPlayer.CurrentHandState.CurrentHandStep == SuitEnums.HandStep.DiscardingLast8Cards;
        let isFollowing = this.mainForm.tractorPlayer.CurrentTrickState.IsStarted() &&
            this.mainForm.tractorPlayer.CurrentTrickState.ShowedCards[this.mainForm.tractorPlayer.MyOwnId].length == 0 &&
            this.mainForm.tractorPlayer.CurrentTrickState.Learder !== this.mainForm.tractorPlayer.MyOwnId;
        let isLeader = !isDiscardingLast8 && !isFollowing;
        if (isDiscardingLast8) {
            //2. 埋底牌
            selectMoreCount = Math.min(selectMoreCount, 8 - 1 - readyCount);
        }
        else if (isFollowing) {
            //3. 跟出
            selectMoreCount = Math.min(selectMoreCount, this.mainForm.tractorPlayer.CurrentTrickState.LeadingCards().length - 1 - readyCount);
        }

        if (!b) {
            let cardsToDump: number[] = []
            let cardsToDumpCardNumber: number[] = []

            let maxCard = showingCardsCp.Rank == 12 ? 11 : 12;
            let selectTopToDump = !isClickedTrump && clickedCardNumber % 13 == maxCard || isClickedTrump && clickedCardNumber == 53; //如果右键点的A或者大王，且满足甩多张的条件，则向左选中所有本门合理可甩的牌
            if (isLeader && selectTopToDump) {
                let singleCardFound = false;
                for (let j = 1; j <= selectMoreCount; j++) {
                    let toAddImage = (this.mainForm.gameScene.cardImages[i - j] as any)
                    let toAddCardNumber = parseInt(toAddImage.getAttribute("serverCardNumber"));
                    let toAddCardImageOnRightImage = (this.mainForm.gameScene.cardImages[i - j + 1] as any)
                    let toAddCardNumberOnRight = parseInt(toAddCardImageOnRightImage.getAttribute("serverCardNumber"));
                    //如果候选牌是同一花色
                    if (!PokerHelper.IsTrump(toAddCardNumber, showingCardsCp.Trump, showingCardsCp.Rank) && !isClickedTrump && PokerHelper.GetSuit(toAddCardNumber) == PokerHelper.GetSuit(clickedCardNumber) ||
                        PokerHelper.IsTrump(toAddCardNumber, showingCardsCp.Trump, showingCardsCp.Rank) && isClickedTrump) {
                        let isSingleCard = toAddCardNumber != toAddCardNumberOnRight;
                        if (isSingleCard) {
                            if (singleCardFound) {
                                showingCardsCp.Clear();
                                break;
                            }
                            else {
                                singleCardFound = true;
                            }
                        }
                        showingCardsCp.AddCard(toAddCardNumberOnRight);
                        cardsToDump.push(i - j + 1);
                        cardsToDumpCardNumber.push(toAddCardNumberOnRight);
                        showingCardsCp.AddCard(toAddCardNumberOnRight);

                        if (!isSingleCard) {
                            cardsToDump.push(i - j);
                            cardsToDumpCardNumber.push(toAddCardNumberOnRight);
                        }

                        if (j > 1) {
                            let tractorCount = showingCardsCp.GetTractorOfAnySuit().length;
                            let needToBreak = false;
                            while (cardsToDumpCardNumber.length > 0 && !(tractorCount > 1 && tractorCount * 2 == showingCardsCp.Count())) {
                                needToBreak = true;
                                let totalCount = cardsToDumpCardNumber.length;
                                let cardNumToDel = cardsToDumpCardNumber[cardsToDumpCardNumber.length - 1];
                                showingCardsCp.RemoveCard(cardNumToDel);
                                showingCardsCp.RemoveCard(cardNumToDel);

                                cardsToDumpCardNumber.splice(totalCount - 1, 1);
                                cardsToDump.splice(totalCount - 1, 1);

                                if (cardsToDumpCardNumber.length > 0 && cardsToDumpCardNumber[totalCount - 2] == cardNumToDel) {
                                    cardsToDumpCardNumber.splice(totalCount - 2, 1);
                                    cardsToDump.splice(totalCount - 2, 1);
                                }
                            }
                            if (needToBreak) {
                                break;
                            }
                        }

                        if (!isSingleCard) {
                            j++;
                        }

                        //特殊情况处理，最后一个单张顶张进不到下个循环，须在上轮循环处理
                        if (j == selectMoreCount && !singleCardFound) {
                            let toAddCardImageOnRightImage = (this.mainForm.gameScene.cardImages[i - j] as any)
                            let toAddCardNumberOnRight = parseInt(toAddCardImageOnRightImage.getAttribute("serverCardNumber"));
                            showingCardsCp.AddCard(toAddCardNumberOnRight);
                            showingCardsCp.AddCard(toAddCardNumberOnRight);
                            let tractorCount = showingCardsCp.GetTractorOfAnySuit().length;
                            if (tractorCount > 1 && tractorCount * 2 == showingCardsCp.Count()) {
                                cardsToDump.push(i - j);
                            }
                        }
                    }
                    else {
                        break;
                    }
                }
            }

            if (cardsToDump.length >= 2) {
                cardsToDump.forEach(c => {
                    this.mainForm.myCardIsReady[c] = !b;
                })
            }
            else {
                showingCardsCp.Clear();
                let selectAll = false; //如果右键点的散牌，则向左选中所有本门花色的牌
                for (let j = 1; j <= selectMoreCount; j++) {
                    let toAddImage = (this.mainForm.gameScene.cardImages[i - j] as any)
                    let toAddCardNumber = parseInt(toAddImage.getAttribute("serverCardNumber"));
                    let toAddCardImageOnRightImage = (this.mainForm.gameScene.cardImages[i - j + 1] as any)
                    let toAddCardNumberOnRight = parseInt(toAddCardImageOnRightImage.getAttribute("serverCardNumber"));
                    //如果候选牌是同一花色: 1. neither is trump, same suit; 2. both are trump
                    if (!PokerHelper.IsTrump(toAddCardNumber, showingCardsCp.Trump, showingCardsCp.Rank) && !isClickedTrump && PokerHelper.GetSuit(toAddCardNumber) == PokerHelper.GetSuit(clickedCardNumber) ||
                        PokerHelper.IsTrump(toAddCardNumber, showingCardsCp.Trump, showingCardsCp.Rank) && isClickedTrump) {
                        if (isLeader) {
                            //第一个出，候选牌为对子，拖拉机
                            if (!selectAll) {
                                showingCardsCp.AddCard(toAddCardNumberOnRight);
                                showingCardsCp.AddCard(toAddCardNumber);
                            }

                            if (showingCardsCp.Count() == 2 && (showingCardsCp.GetPairs().length == 1) || //如果是一对
                                ((showingCardsCp.GetTractorOfAnySuit().length > 1) &&
                                    showingCardsCp.Count() == showingCardsCp.GetTractorOfAnySuit().length * 2))  //如果是拖拉机
                            {
                                this.mainForm.myCardIsReady[i - j] = !b;
                                this.mainForm.myCardIsReady[i - j + 1] = !b;
                                j++;
                            }
                            else if (j == 1 || selectAll) {
                                selectAll = true;
                                this.mainForm.myCardIsReady[i - j] = !b;
                            }
                            else {
                                break;
                            }
                        }
                        else {
                            //埋底或者跟出
                            this.mainForm.myCardIsReady[i - j] = !b;
                        }
                    }
                    else {
                        break;
                    }
                }
            }
        }
        else {
            for (let j = 1; j <= i; j++) {
                let toAddImage = (this.mainForm.gameScene.cardImages[i - j] as any)
                let toAddCardNumber = parseInt(toAddImage.getAttribute("serverCardNumber"));
                let toAddCardImageOnRightImage = (this.mainForm.gameScene.cardImages[i - j + 1] as any)
                let toAddCardNumberOnRight = parseInt(toAddCardImageOnRightImage.getAttribute("serverCardNumber"));
                //如果候选牌是同一花色
                if (PokerHelper.GetSuit(toAddCardNumber) == PokerHelper.GetSuit(clickedCardNumber) ||
                    PokerHelper.IsTrump(toAddCardNumber, showingCardsCp.Trump, showingCardsCp.Rank) && isClickedTrump) {
                    this.mainForm.myCardIsReady[i - j] = !b;
                }
                else {
                    break;
                }
            }
        }
        this.mainForm.SelectedCards.length = 0

        for (let k = 0; k < crlength; k++) {
            let toAddImage = (this.mainForm.gameScene.cardImages[k] as any)
            if (this.mainForm.myCardIsReady[k]) {
                let toAddCardNumber = parseInt(toAddImage.getAttribute("serverCardNumber"));
                this.mainForm.SelectedCards.push(toAddCardNumber);
                //将选定的牌向上提升 via gameScene.cardImages
                if (!toAddImage || !toAddImage.getAttribute("status") || toAddImage.getAttribute("status") === "down") {
                    toAddImage.setAttribute("status", "up");
                    toAddImage.style.transform = `translate(0px, -${CommonMethods.cardTiltHeight}px)`;
                }
            } else if (toAddImage && toAddImage.getAttribute("status") && toAddImage.getAttribute("status") === "up") {
                toAddImage.setAttribute("status", "down");
                toAddImage.style.transform = 'unset';
            }
        }

        this.mainForm.drawingFormHelper.validateSelectedCards();
        this.mainForm.gameScene.sendMessageToServer(CardsReady_REQUEST, this.mainForm.tractorPlayer.MyOwnId, JSON.stringify(this.mainForm.myCardIsReady));
    }

    // with colorful icons if applicabl
    public reDrawToolbar(skipDestroy?: boolean) {
        if (!skipDestroy) this.destroyToolbar();
        //如果打无主，无需再判断
        if (this.mainForm.tractorPlayer.CurrentHandState.Rank == 53)
            return;
        var availableTrump = this.mainForm.tractorPlayer.AvailableTrumps();
        let imageToolBar = this.mainForm.gameScene.toolbarImage;
        if (!imageToolBar) {
            imageToolBar = this.mainForm.gameScene.ui.create.div('.imageToolBar', this.mainForm.gameScene.ui.frameGameRoom);
            imageToolBar.setBackgroundImage('image/tractor/toolbar/suitsbar.png')
            imageToolBar.style['background-size'] = '100% 100%';
            imageToolBar.style['background-repeat'] = 'no-repeat';
            imageToolBar.style.right = `calc(${this.mainForm.gameScene.coordinates.toolbarPosition.x})`;
            imageToolBar.style.bottom = `calc(${this.mainForm.gameScene.coordinates.toolbarPosition.y})`;
            imageToolBar.style.width = `250px`;
            imageToolBar.style.height = `50px`;
            this.mainForm.gameScene.toolbarImage = imageToolBar;
        }

        for (let i = 0; i < 5; i++) {
            let isSuiteAvailable = availableTrump.includes(i + 1)
            let prevSuite = this.mainForm.gameScene.toolbarSuiteImages[i];
            if (prevSuite && (prevSuite.classList.contains(CommonMethods.classIsSuiteAvail) && !isSuiteAvailable || !prevSuite.classList.contains(CommonMethods.classIsSuiteAvail) && isSuiteAvailable)) {
                prevSuite.remove();
                delete this.mainForm.gameScene.toolbarSuiteImages[i];
            } else {
                if (prevSuite) continue;
            }

            let suiteOffset = isSuiteAvailable ? 0 : 5;
            let classIsSuiteAvail = isSuiteAvailable ? `.${CommonMethods.classIsSuiteAvail}` : "";
            let imageToolBarSuit = this.mainForm.gameScene.ui.create.div(`.imageToolBarSuit${classIsSuiteAvail}`, imageToolBar);
            if (this.mainForm.gameScene.ui.storageFileForImages.hasOwnProperty(`toolbar${i + suiteOffset}`)) {
                imageToolBarSuit.setBackgroundImage(this.mainForm.gameScene.ui.storageFileForImages[`toolbar${i + suiteOffset}`]);
            } else {
                imageToolBarSuit.setBackgroundImage(`image/tractor/toolbar/tile0${(i + suiteOffset).toString().padStart(2, '0')}.png`);
            }
            imageToolBarSuit.style['background-size'] = '100% 100%';
            imageToolBarSuit.style['background-repeat'] = 'no-repeat';
            imageToolBarSuit.style.width = `40px`;
            imageToolBarSuit.style.height = `40px`;
            imageToolBarSuit.style.right = `calc(5px + ${50 * (4 - i)}px)`;
            imageToolBarSuit.style.bottom = "5px";
            this.mainForm.gameScene.toolbarSuiteImages[i] = imageToolBarSuit;

            if (isSuiteAvailable && !this.mainForm.tractorPlayer.isObserver) {
                let trumpExpIndex = this.mainForm.tractorPlayer.CurrentHandState.TrumpExposingPoker + 1
                if (i == 4) {
                    if (this.mainForm.tractorPlayer.CurrentPoker.RedJoker() == 2) trumpExpIndex = SuitEnums.TrumpExposingPoker.PairRedJoker
                    else trumpExpIndex = SuitEnums.TrumpExposingPoker.PairBlackJoker
                }
                imageToolBarSuit.addEventListener('pointerdown', () => {
                    this.mainForm.tractorPlayer.ExposeTrump(trumpExpIndex, i + 1, 0);
                })
            }
        }
    }

    public TrumpMadeCardsShow() {
        this.destroyAllShowedCards()
        if (this.mainForm.tractorPlayer.CurrentHandState.IsNoTrumpMaker) return
        if (this.mainForm.tractorPlayer.CurrentHandState.TrumpExposingPoker == SuitEnums.TrumpExposingPoker.None) return
        let posID = this.mainForm.PlayerPosition[this.mainForm.tractorPlayer.CurrentHandState.TrumpMaker]
        if (posID == 1) return

        var trumpMadeCard = (this.mainForm.tractorPlayer.CurrentHandState.Trump - 1) * 13 + this.mainForm.tractorPlayer.CurrentHandState.Rank;
        if (this.mainForm.tractorPlayer.CurrentHandState.TrumpExposingPoker == SuitEnums.TrumpExposingPoker.PairBlackJoker)
            trumpMadeCard = 52;
        else if (this.mainForm.tractorPlayer.CurrentHandState.TrumpExposingPoker == SuitEnums.TrumpExposingPoker.PairRedJoker)
            trumpMadeCard = 53;

        if (this.mainForm.tractorPlayer.CurrentHandState.TrumpExposingPoker > SuitEnums.TrumpExposingPoker.SingleRank) {
            this.DrawShowedCardsByPosition([trumpMadeCard, trumpMadeCard], posID)
        } else {
            this.DrawShowedCardsByPosition([trumpMadeCard], posID)
        }
    }

    public TrumpMadeCardsShowFromLastTrick() {
        let trumpDict: any = {}
        let lastTrumpStates: TrumpState[] = this.mainForm.tractorPlayer.CurrentHandState.LastTrumpStates

        // 如果是无人亮主，则不画
        if (lastTrumpStates.length === 1 && lastTrumpStates[0].IsNoTrumpMaker) return;

        lastTrumpStates.forEach(lastHandState => {
            let key1 = lastHandState.TrumpMaker;
            if (!Object.keys(trumpDict).includes(key1)) {
                trumpDict[key1] = {}
            }
            let val1 = trumpDict[key1];

            let key2: number = lastHandState.Trump;
            if (!Object.keys(val1).includes(key2.toString())) {
                val1[key2.toString()] = lastHandState;
            }
            let val2: TrumpState = val1[key2.toString()];
            val2.TrumpExposingPoker = Math.max(val2.TrumpExposingPoker, lastHandState.TrumpExposingPoker);
        })

        for (const [key, value] of Object.entries(trumpDict)) {
            let player = key;
            let posIndex = this.mainForm.PlayerPosition[player];
            let suitToTrumInfo: any = value;

            let allTrumpCards: number[] = []
            for (const [key, value] of Object.entries(suitToTrumInfo)) {
                let trump: number = parseInt(key);
                let trumpInfo: TrumpState = value as TrumpState;

                var trumpMadeCard = (trump - 1) * 13 + this.mainForm.tractorPlayer.CurrentHandState.Rank;

                if (trumpInfo.TrumpExposingPoker == SuitEnums.TrumpExposingPoker.PairBlackJoker)
                    trumpMadeCard = 52;
                else if (trumpInfo.TrumpExposingPoker == SuitEnums.TrumpExposingPoker.PairRedJoker)
                    trumpMadeCard = 53;

                let count = 1;
                if (trumpInfo.TrumpExposingPoker > SuitEnums.TrumpExposingPoker.SingleRank) {
                    count = 2;
                }
                for (let i = 0; i < count; i++) {
                    allTrumpCards.push(trumpMadeCard)
                }
            }
            this.DrawTrumpMadeCardsByPositionFromLastTrick(allTrumpCards, posIndex)
        }
    }

    public destroyToolbar() {
        if (this.mainForm.gameScene.toolbarImage) {
            this.mainForm.gameScene.toolbarImage.remove();
            delete this.mainForm.gameScene.toolbarImage;
        }
        this.mainForm.gameScene.toolbarSuiteImages.forEach(image => {
            image.remove();
        })
        this.mainForm.gameScene.toolbarSuiteImages = []
    }

    public destroySidebar() {
        this.mainForm.gameScene.sidebarImages.forEach(image => {
            image.remove();
        })
        this.mainForm.gameScene.sidebarImages = []
    }

    public destroyAllCards() {
        this.mainForm.gameScene.cardImages.forEach((image: any) => {
            image.remove();
        })
        this.mainForm.gameScene.cardImages = []
        for (let i = 0; i < 54; i++) {
            this.mainForm.gameScene.cardServerNumToImage[i] = [];
        }
        this.mainForm.cardsOrderNumber = 0;

        this.mainForm.gameScene.cardImageSequence.forEach((image: any) => {
            image.remove();
        })
        this.mainForm.gameScene.cardImageSequence = []
    }

    public resetAllCards() {
        this.mainForm.cardsOrderNumber = 0;

        this.mainForm.gameScene.cardImageSequence.forEach((image: any) => {
            image.remove();
        })
        this.mainForm.gameScene.cardImageSequence = []
        for (const [key, ci] of Object.entries(this.mainForm.gameScene.cardServerNumToImage)) {
            (ci as any[]).forEach((c: any) => {
                c.classList.remove(CommonMethods.classCardProcessed);
                c.setAttribute("status", "down");
                c.style.transform = 'unset';
            })
        }
    }

    public destroyAllShowedCards() {
        this.mainForm.gameScene.showedCardImages.forEach(image => {
            image.remove();
        })
        this.mainForm.gameScene.showedCardImages = []

        if (this.mainForm.gameScene.OverridingFlagImage) {
            this.mainForm.gameScene.OverridingFlagImage.remove()
        }
    }

    // drawing showed cards
    public DrawShowedCardsByPosition(cards: number[], pos: number) {
        let x = this.mainForm.gameScene.coordinates.showedCardsPositions[pos - 1].x
        let y = this.mainForm.gameScene.coordinates.showedCardsPositions[pos - 1].y
        this.DrawShowedCards(cards, x, y, this.mainForm.gameScene.showedCardImages, 1, pos)
    }

    // drawing TrumpMade cards from last trick
    public DrawTrumpMadeCardsByPositionFromLastTrick(cards: number[], pos: number) {
        let x = this.mainForm.gameScene.coordinates.trumpMadeCardsPositions[pos - 1].x
        let y = this.mainForm.gameScene.coordinates.trumpMadeCardsPositions[pos - 1].y
        this.DrawShowedCards(cards, x, y, this.mainForm.gameScene.showedCardImages, this.mainForm.gameScene.coordinates.trumpMadeCardsScale, pos === 3 ? 7 : pos, true);
    }

    public DrawSidebarFull() {
        let isRoomFull = CommonMethods.GetPlayerCount(this.mainForm.tractorPlayer.CurrentGameState.Players) == 4
        this.destroySidebar()
        let meRank = "2"
        let opRank = "2"

        if (isRoomFull) {
            let allPlayers = this.mainForm.tractorPlayer.CurrentGameState.Players
            let meIndex = CommonMethods.GetPlayerIndexByID(allPlayers, this.mainForm.tractorPlayer.PlayerId)
            let opIndex = (meIndex + 1) % 4
            meRank = CommonMethods.GetNumberString(allPlayers[meIndex].Rank)
            opRank = CommonMethods.GetNumberString(allPlayers[opIndex].Rank)
        }

        let meStarterString = ""
        let opStarterString = ""
        let starter = this.mainForm.tractorPlayer.CurrentHandState.Starter
        if (starter) {
            let isMyTeamStarter = this.mainForm.PlayerPosition[starter] % 2 == 1
            if (isMyTeamStarter) meStarterString = `，做庄：${this.mainForm.gameScene.hidePlayerID ? "" : starter}`
            else opStarterString = `，做庄：${this.mainForm.gameScene.hidePlayerID ? "" : starter}`
        }

        let meString = `我方：${meRank}${meStarterString}`
        let opString = `对方：${opRank}${opStarterString}`

        var sidebarMeText = this.mainForm.gameScene.ui.create.div('.sidebarMeText', meString, this.mainForm.gameScene.ui.frameGameRoom);
        sidebarMeText.style.fontFamily = 'serif';
        sidebarMeText.style.fontSize = '20px';
        sidebarMeText.style.color = 'orange';
        sidebarMeText.style.textAlign = 'left';
        sidebarMeText.style.left = `calc(0px)`;
        sidebarMeText.style.top = `calc(60px)`;
        this.mainForm.gameScene.sidebarImages.push(sidebarMeText)

        var sidebarOpText = this.mainForm.gameScene.ui.create.div('.sidebarOpText', opString, this.mainForm.gameScene.ui.frameGameRoom);
        sidebarOpText.style.fontFamily = 'serif';
        sidebarOpText.style.fontSize = '20px';
        sidebarOpText.style.color = 'orange';
        sidebarOpText.style.textAlign = 'left';
        sidebarOpText.style.left = `calc(0px)`;
        sidebarOpText.style.top = `calc(90px)`;
        this.mainForm.gameScene.sidebarImages.push(sidebarOpText)

        let trumpMakerString = ""
        let trumpIndex = 0
        let trumpMaker = this.mainForm.tractorPlayer.CurrentHandState.TrumpMaker
        if (trumpMaker && this.mainForm.tractorPlayer.CurrentHandState.IsNoTrumpMaker) {
            trumpMakerString = "无人亮主"
        } else if (trumpMaker) {
            trumpMakerString = trumpMaker
            trumpIndex = this.mainForm.tractorPlayer.CurrentHandState.Trump
        }
        let exposerString = `亮牌：${this.mainForm.gameScene.hidePlayerID ? "" : trumpMakerString}`

        var sidebarTrumpText = this.mainForm.gameScene.ui.create.div('.sidebarTrumpText', exposerString, this.mainForm.gameScene.ui.frameGameRoom);
        sidebarTrumpText.style.fontFamily = 'serif';
        sidebarTrumpText.style.fontSize = '20px';
        sidebarTrumpText.style.color = 'orange';
        sidebarTrumpText.style.textAlign = 'left';
        sidebarTrumpText.style.left = `calc(0px)`;
        sidebarTrumpText.style.top = `calc(120px)`;
        this.mainForm.gameScene.sidebarImages.push(sidebarTrumpText)

        if (trumpMaker && !this.mainForm.tractorPlayer.CurrentHandState.IsNoTrumpMaker) {
            let count = 1;
            if (this.mainForm.tractorPlayer.CurrentHandState.TrumpExposingPoker > SuitEnums.TrumpExposingPoker.SingleRank) count++;
            if (this.mainForm.tractorPlayer.CurrentHandState.TrumpExposingPoker === SuitEnums.TrumpExposingPoker.PairBlackJoker) trumpIndex = 10;

            let x = sidebarTrumpText.clientWidth + 10;
            let increment = 25;
            for (let i = 0; i < count; i++) {
                var sidebarTrumpImage = this.mainForm.gameScene.ui.create.div('.sidebarTrumpImage', '', this.mainForm.gameScene.ui.frameGameRoom);
                if (this.mainForm.gameScene.ui.storageFileForImages.hasOwnProperty(`toolbar${trumpIndex - 1}`)) {
                    sidebarTrumpImage.setBackgroundImage(this.mainForm.gameScene.ui.storageFileForImages[`toolbar${trumpIndex - 1}`]);
                } else {
                    sidebarTrumpImage.setBackgroundImage(`image/tractor/toolbar/tile0${(trumpIndex - 1).toString().padStart(2, '0')}.png`);
                }
                sidebarTrumpImage.style['background-size'] = '100% 100%';
                sidebarTrumpImage.style['background-repeat'] = 'no-repeat';
                sidebarTrumpImage.style.width = `25px`;
                sidebarTrumpImage.style.height = `25px`;
                sidebarTrumpImage.style.left = `calc(${x}px)`;
                sidebarTrumpImage.style.top = `calc(120px)`;
                this.mainForm.gameScene.sidebarImages.push(sidebarTrumpImage)

                x += increment;
            }
        }
    }

    public DrawFinishedSendedCards() {
        this.mainForm.tractorPlayer.destroyAllClientMessages()
        this.destroyScoreImageAndCards()
        this.destroyLast8Cards()
        this.destroyAllShowedCards()
        this.DrawFinishedScoreImage()
    }

    private DrawFinishedScoreImage() {
        //画底牌
        let posX = this.mainForm.gameScene.coordinates.last8Position.x
        let posY = this.mainForm.gameScene.coordinates.last8Position.y
        this.DrawShowedCards(this.mainForm.tractorPlayer.CurrentHandState.DiscardedCards, posX, posY, this.mainForm.gameScene.showedCardImages, 1, 3)
        //画上分牌
        posX = this.mainForm.gameScene.coordinates.scoreCardsPosition.x
        posY = this.mainForm.gameScene.coordinates.scoreCardsPosition.y
        this.DrawShowedCards(this.mainForm.tractorPlayer.CurrentHandState.ScoreCards, posX, posY, this.mainForm.gameScene.showedCardImages, 1, 3)

        //画得分明细
        //上分
        let winPoints = CommonMethods.GetScoreCardsScore(this.mainForm.tractorPlayer.CurrentHandState.ScoreCards);
        posX = this.mainForm.gameScene.coordinates.winPointsPosition.x
        posY = this.mainForm.gameScene.coordinates.winPointsPosition.y
        var earnedPointsImage = this.mainForm.gameScene.ui.create.div('.earnedPointsImage', `上分：${winPoints}`, this.mainForm.gameScene.ui.frameGameRoom);
        earnedPointsImage.style.fontFamily = 'serif';
        earnedPointsImage.style.fontSize = '20px';
        earnedPointsImage.style.color = 'orange';
        earnedPointsImage.style.textAlign = 'left';
        earnedPointsImage.style.left = `calc(${posX})`;
        earnedPointsImage.style.top = `calc(${posY})`;
        this.mainForm.gameScene.showedCardImages.push(earnedPointsImage)

        //底分
        let base = this.mainForm.tractorPlayer.CurrentHandState.ScoreLast8CardsBase
        let multiplier = this.mainForm.tractorPlayer.CurrentHandState.ScoreLast8CardsMultiplier
        let last8Points = base * multiplier
        posX = this.mainForm.gameScene.coordinates.last8PointsPosition.x
        posY = this.mainForm.gameScene.coordinates.last8PointsPosition.y

        var last8PointsImage = this.mainForm.gameScene.ui.create.div('.last8PointsImage', `底分：${last8Points}`, this.mainForm.gameScene.ui.frameGameRoom);
        last8PointsImage.style.fontFamily = 'serif';
        last8PointsImage.style.fontSize = '20px';
        last8PointsImage.style.color = 'orange';
        last8PointsImage.style.textAlign = 'left';
        last8PointsImage.style.left = `calc(${posX})`;
        last8PointsImage.style.top = `calc(${posY})`;
        this.mainForm.gameScene.showedCardImages.push(last8PointsImage);

        //底分明细
        if (base > 0) {
            posX = `${posX} + ${last8PointsImage.clientWidth + 10}px`;
            var last8PointsDetailImage = this.mainForm.gameScene.ui.create.div('.last8PointsDetailImage', `【${base}x${multiplier}】`, this.mainForm.gameScene.ui.frameGameRoom);
            last8PointsDetailImage.style.fontFamily = 'serif';
            last8PointsDetailImage.style.fontSize = '20px';
            last8PointsDetailImage.style.color = 'yellow';
            last8PointsDetailImage.style.textAlign = 'left';
            last8PointsDetailImage.style.left = `calc(${posX})`;
            last8PointsDetailImage.style.top = `calc(${posY})`;
            this.mainForm.gameScene.showedCardImages.push(last8PointsDetailImage);
        }

        //罚分
        let scorePunishment = this.mainForm.tractorPlayer.CurrentHandState.ScorePunishment
        posX = this.mainForm.gameScene.coordinates.punishmentPointsPosition.x
        posY = this.mainForm.gameScene.coordinates.punishmentPointsPosition.y
        var punishPointsImage = this.mainForm.gameScene.ui.create.div('.punishPointsImage', `罚分：${scorePunishment}`, this.mainForm.gameScene.ui.frameGameRoom);
        punishPointsImage.style.fontFamily = 'serif';
        punishPointsImage.style.fontSize = '20px';
        punishPointsImage.style.color = 'orange';
        punishPointsImage.style.textAlign = 'left';
        punishPointsImage.style.left = `calc(${posX})`;
        punishPointsImage.style.top = `calc(${posY})`;
        this.mainForm.gameScene.showedCardImages.push(punishPointsImage);

        //总得分
        let allTotal = this.mainForm.tractorPlayer.CurrentHandState.Score
        posX = this.mainForm.gameScene.coordinates.totalPointsPosition.x
        posY = this.mainForm.gameScene.coordinates.totalPointsPosition.y
        var totalPointsImage = this.mainForm.gameScene.ui.create.div('.totalPointsImage', `总分：${allTotal}`, this.mainForm.gameScene.ui.frameGameRoom);
        totalPointsImage.style.fontFamily = 'serif';
        totalPointsImage.style.fontSize = '20px';
        totalPointsImage.style.color = 'white';
        totalPointsImage.style.textAlign = 'left';
        totalPointsImage.style.left = `calc(${posX})`;
        totalPointsImage.style.top = `calc(${posY})`;
        this.mainForm.gameScene.showedCardImages.push(totalPointsImage);
    }

    public destroyScoreTotalText() {
        if (this.mainForm.gameScene.scoreTotalText) {
            this.mainForm.gameScene.scoreTotalText.remove();
            delete this.mainForm.gameScene.scoreTotalText;
        }
    }

    public destroyScoreImageAndCards() {
        this.mainForm.gameScene.scoreCardsImages.forEach(image => {
            image.remove();
        })
        this.mainForm.gameScene.scoreCardsImages = []
        this.destroyScoreTotalText();
        this.mainForm.gameScene.scoreCardsIntsDrawn = []
    }

    public DrawScoreImageAndCards() {
        this.destroyScoreTotalText();
        //画得分图标
        let scores = this.mainForm.tractorPlayer.CurrentHandState.Score;
        var currentPointsText = this.mainForm.gameScene.ui.create.div('.currentPointsText', `上分：${scores}`, this.mainForm.gameScene.ui.frameGameRoom);
        currentPointsText.style.fontFamily = 'serif';
        currentPointsText.style.fontSize = '20px';
        currentPointsText.style.color = 'orange';
        currentPointsText.style.textAlign = 'left';
        currentPointsText.style.left = `calc(0px)`;
        currentPointsText.style.top = `calc(150px)`;
        this.mainForm.gameScene.scoreTotalText = currentPointsText;

        //画得分牌，画在得分图标的下边
        //静态
        if (this.mainForm.gameScene.isReplayMode) {
            this.DrawShowedCards(this.mainForm.tractorPlayer.CurrentHandState.ScoreCards, "0px", "180px", this.mainForm.gameScene.scoreCardsImages, 1 / 2, 6);
            return;
        }

        //动画
        let scale = 2 / 3;
        let scoreCardsIntsTotal: number[] = CommonMethods.deepCopy<number[]>(this.mainForm.tractorPlayer.CurrentHandState.ScoreCards);
        let scIntsToDraw = CommonMethods.ArrayMinus(scoreCardsIntsTotal, this.mainForm.gameScene.scoreCardsIntsDrawn);
        let sciToDrawLocked = CommonMethods.deepCopy<number[]>(scIntsToDraw);
        let showedCardImagesIdentifiedIndex: number[] = [];
        let scoreCardsImagesToAnimate: any[] = [];
        for (let i = 0; i < sciToDrawLocked.length; i++) {
            let curServerCardNum = sciToDrawLocked[i];
            for (let j = 0; j < this.mainForm.gameScene.showedCardImages.length; j++) {
                if (showedCardImagesIdentifiedIndex.includes(j)) continue;
                let cardImageShowed = this.mainForm.gameScene.showedCardImages[j];
                let serverCardNumFromImage: number = parseInt(cardImageShowed.getAttribute("serverCardNumber"));
                if (serverCardNumFromImage === curServerCardNum) {
                    scoreCardsImagesToAnimate.push(cardImageShowed);
                    scIntsToDraw = CommonMethods.ArrayRemoveOneByValue(scIntsToDraw, serverCardNumFromImage);
                    showedCardImagesIdentifiedIndex.push(j);
                    break;
                }
            }
        }
        let tempX = `0px + ${this.mainForm.gameScene.coordinates.handCardOffset * scale * this.mainForm.gameScene.scoreCardsIntsDrawn.length}px`
        this.DrawShowedCards(scIntsToDraw, tempX, "180px", this.mainForm.gameScene.scoreCardsImages, scale, 6);
        this.mainForm.gameScene.scoreCardsIntsDrawn = this.mainForm.gameScene.scoreCardsIntsDrawn.concat(scIntsToDraw);
        let IntsDrawnLen = this.mainForm.gameScene.scoreCardsIntsDrawn.length;

        let scitaLen = scoreCardsImagesToAnimate.length;
        if (scitaLen === 0) return;
        let scitaCopy: any[] = [];
        for (let i = 0; i < scitaLen; i++) {
            let cardImageOriginal = scoreCardsImagesToAnimate[i];
            let serverCardNumFromImage: number = parseInt(cardImageOriginal.getAttribute("serverCardNumber"));
            let uiCardNumber = CommonMethods.ServerToUICardMap[serverCardNumFromImage];
            let cardImageClone = this.createCard(this.mainForm.gameScene.ui.frameGameRoom, uiCardNumber, scale);
            cardImageClone.style.opacity = 0;
            cardImageClone.style.left = `${cardImageOriginal.offsetLeft}px`;
            cardImageClone.style.top = `${cardImageOriginal.offsetTop}px`;
            cardImageClone.style.width = `${cardImageOriginal.clientWidth}px`;
            cardImageClone.style.height = `${cardImageOriginal.clientHeight}px`;
            cardImageClone.style.transition = `${CommonMethods.distributeLast8Duration}s`;
            cardImageClone.style['transition-delay'] = `${CommonMethods.distributeLast8Interval * (i + 1)}s`;
            scitaCopy.push(cardImageClone);
            this.mainForm.gameScene.scoreCardsImages.push(cardImageClone);
            this.mainForm.gameScene.ui.frameGameRoom.appendChild(cardImageClone);
            this.mainForm.gameScene.scoreCardsIntsDrawn.push(serverCardNumFromImage);
        }

        setTimeout((scitaCp: any[]) => {
            let startX = this.mainForm.gameScene.coordinates.handCardOffset * scale * IntsDrawnLen;
            let startY = 180;
            let wid = this.mainForm.gameScene.coordinates.cardWidth * scale;
            let hei = this.mainForm.gameScene.coordinates.cardHeight * scale;
            for (let i = 0; i < scitaLen; i++) {
                let curImage: any = scitaCp[i]
                curImage.style.opacity = 1;
                curImage.style.left = `calc(${startX}px)`;
                curImage.style.top = `calc(${startY}px)`;
                curImage.style.width = `calc(${wid}px)`;
                curImage.style.height = `calc(${hei}px)`;
                startX += this.mainForm.gameScene.coordinates.handCardOffset * (scale);
            }
        }, 1000 * CommonMethods.distributeLast8Delay, scitaCopy);
    }

    public destroyLast8Cards() {
        this.mainForm.gameScene.last8CardsImages.forEach(image => {
            image.remove();
        })
        this.mainForm.gameScene.last8CardsImages = []
    }

    public DrawDiscardedCards(doAni?: boolean) {
        this.destroyLast8Cards()
        let allCards = Array(8).fill(CommonMethods.cardBackIndex);
        if (this.mainForm.tractorPlayer.CurrentHandState.Last8Holder === this.mainForm.tractorPlayer.PlayerId || this.mainForm.gameScene.isReplayMode) {
            allCards = this.mainForm.tractorPlayer.CurrentHandState.DiscardedCards;
        }

        if (!doAni) {
            let posX = this.mainForm.gameScene.coordinates.last8CardsForStarterPosition.x
            let posY = this.mainForm.gameScene.coordinates.last8CardsForStarterPosition.y
            this.DrawShowedCards(allCards, posX, posY, this.mainForm.gameScene.last8CardsImages, 0.67, 5)
        } else {
            //画8张底牌，初始位置
            let x = this.mainForm.gameScene.coordinates.discardLast8AniPosition.x
            let y = this.mainForm.gameScene.coordinates.discardLast8AniPosition.y
            this.DrawShowedCards(allCards, x, y, this.mainForm.gameScene.last8CardsImages, 1, 5)
            this.MoveDiscardedLast8Cards();
        }
    }

    //画庄家埋底的动画
    public MoveDiscardedLast8Cards() {
        let posX = `${this.mainForm.gameScene.coordinates.last8CardsForStarterPosition.x} - ${this.mainForm.gameScene.coordinates.cardWidth / 6}px`;
        let posY = `${this.mainForm.gameScene.coordinates.last8CardsForStarterPosition.y} - ${this.mainForm.gameScene.coordinates.cardHeight / 6}px`;
        let scale = 0.67;
        let count = this.mainForm.gameScene.last8CardsImages.length
        for (let i = 0; i < count; i++) {
            let cardImage: any = this.mainForm.gameScene.last8CardsImages[i];
            cardImage.style.transition = `${CommonMethods.distributeLast8Duration}s`;
            cardImage.style['transition-delay'] = `${CommonMethods.distributeLast8Interval * (7 - i)}s`;
        }
        //画8张底牌，最终位置
        setTimeout((x, y, sc) => {
            for (let i = count - 1; i >= 0; i--) {
                let curImage: any = this.mainForm.gameScene.last8CardsImages[i]
                curImage.style.right = `calc(${x})`;
                curImage.style.top = `calc(${y})`;
                curImage.style.scale = sc;
                x = `${x} + ${this.mainForm.gameScene.coordinates.handCardOffset * sc}px`;
            }
        }, 1000 * CommonMethods.distributeLast8Delay, posX, posY, scale);
    }

    //基于庄家相对于自己所在的位置，画庄家获得底牌的动画
    public DrawDistributingLast8Cards(position: number) {
        //画8张底牌
        let last8Images: any[] = []
        let x = this.mainForm.gameScene.coordinates.distributingLast8Position.x
        let y = this.mainForm.gameScene.coordinates.distributingLast8Position.y
        let cardBackIndex = 54

        for (let i = 0; i < 8; i++) {
            let cardImage = this.createCard(this.mainForm.gameScene.ui.frameGameRoom, cardBackIndex, 1);
            cardImage.style.left = `calc(${x})`;
            cardImage.style.bottom = `calc(${y})`;
            cardImage.style.transition = `${CommonMethods.distributeLast8Duration}s`;
            cardImage.style['transition-delay'] = `${CommonMethods.distributeLast8Interval * (7 - i)}s`;
            x = `${x} + ${this.mainForm.gameScene.coordinates.distributingLast8PositionOffset}px`;
            last8Images.push(cardImage);
        }

        //分发
        setTimeout(() => {
            for (let i = 7; i >= 0; i--) {
                let posInd = position - 1;
                let curImage: any = last8Images[i]
                if (posInd === 1) curImage.style.left = `calc(100% - ${this.mainForm.gameScene.coordinates.cardWidth}px)`;
                else curImage.style.left = `calc(${this.mainForm.gameScene.coordinates.playerSkinPositions[posInd].x})`;
                if (posInd === 2) curImage.style.bottom = `calc(99% - ${this.mainForm.gameScene.coordinates.cardHeight}px)`;
                else curImage.style.bottom = `calc(${this.mainForm.gameScene.coordinates.playerSkinPositions[posInd].y})`;
            }
        }, 1000 * CommonMethods.distributeLast8Delay);
        //隐藏
        setTimeout(() => {
            last8Images.forEach(image => {
                image.remove();
            })
            last8Images.length = 0
        }, 1500);
    }

    public DrawOverridingFlag(cardsCount: number, position: number, winType: number, playAnimation: boolean) {
        if (this.mainForm.tractorPlayer.CurrentRoomSetting.HideOverridingFlag) return;
        if (this.mainForm.tractorPlayer.ShowLastTrickCards) return;

        if (this.mainForm.gameScene.OverridingFlagImage) {
            this.mainForm.gameScene.OverridingFlagImage.remove()
        }

        var orImage = this.mainForm.gameScene.ui.create.div('.orImage', this.mainForm.gameScene.ui.frameGameRoom);
        orImage.setBackgroundImage(`image/tractor/${this.mainForm.gameScene.overridingLabelImages[winType]}.png`)

        let posInd = position - 1
        let x = this.mainForm.gameScene.coordinates.showedCardsPositions[posInd].x
        if (posInd === 0 || posInd === 2) {
            x = `${x} - ${this.mainForm.gameScene.coordinates.handCardOffset * (cardsCount - 1) / 2}px`;
        }

        let y = this.mainForm.gameScene.coordinates.showedCardsPositions[posInd].y;
        switch (posInd) {
            case 1:
                x = `${x} + ${this.mainForm.gameScene.coordinates.handCardOffset * (cardsCount - 1)}px`;
                orImage.style.right = `calc(${x} + ${this.mainForm.gameScene.coordinates.cardWidth - this.mainForm.gameScene.coordinates.overridingFlagWidth}px)`;
                orImage.style.bottom = `calc(${y})`;
                break;
            case 2:
                y = `${y} + ${this.mainForm.gameScene.coordinates.cardHeight - this.mainForm.gameScene.coordinates.overridingFlagHeight}px`;
                orImage.style.left = `calc(${x})`;
                orImage.style.top = `calc(${y})`;
                break;
            default:
                orImage.style.left = `calc(${x})`;
                orImage.style.bottom = `calc(${y})`;
                break;
        }

        orImage.style.width = `${this.mainForm.gameScene.coordinates.overridingFlagWidth}px`;
        orImage.style.height = `${this.mainForm.gameScene.coordinates.overridingFlagHeight}px`;
        orImage.style['background-size'] = '100% 100%';
        orImage.style['background-repeat'] = 'no-repeat';
        this.mainForm.gameScene.OverridingFlagImage = orImage;

        if (playAnimation && winType >= 2) {
            // getting the location of the OverridingFlag image, which should match the first showed cards from the winner player
            var rect = orImage.getBoundingClientRect();
            decadeUI.animation.playSpine2D(this.mainForm.gameScene.overridingLabelAnims[winType][0], rect.left, document.documentElement.clientHeight - rect.bottom, this.mainForm.gameScene.coordinates.cardWidth, this.mainForm.gameScene.coordinates.cardHeight, this.mainForm.gameScene.overridingLabelAnims[winType][1]);
        }
    }

    public DrawEmojiByPosition(position: number, emojiType: number, emojiIndex: number, isCenter: boolean) {
        let emojiURL = `image/tractor/emoji/${EmojiUtil.emojiTypes[emojiType]}${emojiIndex}.gif?${new Date().getTime()}`;

        var img = new Image();
        img.onload = (e: any) => {
            let fixedWidth, fixedHeight: number;
            let wid = e.target.width;
            let hei = e.target.height;

            var emojiImage = this.mainForm.gameScene.ui.create.div('.emojiImage', this.mainForm.gameScene.ui.frameGameRoom);
            emojiImage.style.position = 'absolute';
            if (isCenter) {
                if (this.mainForm.gameScene.isInGameHall()) {
                    fixedWidth = this.mainForm.gameScene.ui.frameGameHall.clientWidth / 2;
                } else {
                    fixedWidth = this.mainForm.gameScene.ui.frameGameRoom.clientWidth / 2;
                }
                fixedHeight = fixedWidth * hei / wid;
                emojiImage.style.top = 'calc(50%)';
                emojiImage.style.left = 'calc(50%)';
                emojiImage.style.width = `calc(${fixedWidth}px)`;
                emojiImage.style.height = `calc(${fixedHeight}px)`;
                emojiImage.style.transform = `translate(-50%, -50%)`;
                emojiImage.style.transition = `0s`;
            }
            else {
                fixedHeight = EmojiUtil.fixedHeight;
                fixedWidth = fixedHeight * wid / hei;
                emojiImage.style.width = `calc(${fixedWidth}px)`;
                emojiImage.style.height = `calc(${fixedHeight}px)`;
                let x = this.mainForm.gameScene.coordinates.trumpMadeCardsPositions[position - 1].x;
                let y = this.mainForm.gameScene.coordinates.trumpMadeCardsPositions[position - 1].y;
                if (position === 1) y = this.mainForm.gameScene.coordinates.handCardPositions[3].y;
                switch (position) {
                    case 1:
                    case 4:
                        emojiImage.style.left = `calc(${x})`;
                        emojiImage.style.bottom = `calc(${y})`;
                        break;
                    case 2:
                        emojiImage.style.right = `calc(${x})`;
                        emojiImage.style.bottom = `calc(${y})`;
                        break;
                    case 3:
                        emojiImage.style.right = `calc(${x})`;
                        emojiImage.style.top = `calc(${y})`;
                        break;
                    default:
                        break;
                }
            }
            // emojiImage.style.zIndex = CommonMethods.zIndexSettingsForm;
            emojiImage.setBackgroundImage(emojiURL)
            emojiImage.style['background-size'] = '100% 100%';
            emojiImage.style['background-repeat'] = 'no-repeat';

            setTimeout(() => {
                emojiImage.remove();
            }, 1000 * EmojiUtil.displayDuration);
        };
        img.src = emojiURL;
    }

    public DrawMovingTractorByPosition(cardsCount: number, position: number) {
        let height = this.mainForm.gameScene.coordinates.cardHeight - 10;
        let width = height * 10 / 9;

        var torImage = this.mainForm.gameScene.ui.create.div('.orImage', this.mainForm.gameScene.ui.frameGameRoom);
        torImage.hide();
        torImage.setBackgroundImage(`image/tractor/movingtrac4.gif`)

        let posInd = position - 1
        let x = this.mainForm.gameScene.coordinates.showedCardsPositions[posInd].x
        if (posInd === 0 || posInd === 2) {
            x = `${x} - ${this.mainForm.gameScene.coordinates.handCardOffset * (cardsCount - 1) / 2}px`;
        }

        let y = this.mainForm.gameScene.coordinates.showedCardsPositions[posInd].y;
        switch (posInd) {
            case 1:
                x = `${x} + ${this.mainForm.gameScene.coordinates.handCardOffset * (cardsCount - 1)}px`;
                torImage.style.right = `calc(${x} + ${this.mainForm.gameScene.coordinates.cardWidth - width}px)`;
                torImage.style.bottom = `calc(${y})`;
                break;
            case 2:
                y = `${y} + ${this.mainForm.gameScene.coordinates.cardHeight - height}px`;
                torImage.style.left = `calc(${x})`;
                torImage.style.top = `calc(${y})`;
                break;
            default:
                torImage.style.left = `calc(${x})`;
                torImage.style.bottom = `calc(${y})`;
                break;
        }

        torImage.style.width = `${width}px`;
        torImage.style.height = `${height}px`;
        torImage.style['background-size'] = '100% 100%';
        torImage.style['background-repeat'] = 'no-repeat';

        torImage.show();
        setTimeout(() => {
            torImage.hide();
        }, 3000);


        // movingtrac3.gif
        // let posInd = position - 1
        // let height = this.mainForm.gameScene.coordinates.cardHeight - 10;
        // let x = this.mainForm.gameScene.coordinates.showedCardsPositions[posInd].x;
        // let y = `${this.mainForm.gameScene.coordinates.showedCardsPositions[posInd].y} + ${this.mainForm.gameScene.coordinates.cardHeight - height}px`;
        // switch (posInd) {
        //     case 0:
        //         x = x - (cardsCount - 1) * this.mainForm.gameScene.coordinates.handCardOffset / 2
        //         break;
        //     case 1:
        //         x = x - (cardsCount - 1) * this.mainForm.gameScene.coordinates.handCardOffset
        //         break;
        //     case 2:
        //         x = x - (cardsCount - 1) * this.mainForm.gameScene.coordinates.handCardOffset / 2
        //         break;
        //     case 3:
        //         break;
        //     default:
        //         break;
        // }
        // let spriteAnimation = this.mainForm.gameScene.add.sprite(x, y, EmojiUtil.emMovingTractor)
        //     .setDisplaySize(height * EmojiUtil.emMovingTractorYToXRatio, height);
        // spriteAnimation.setOrigin(0);
        // spriteAnimation.play(EmojiUtil.emMovingTractor);
    }

    public DrawDanmu(msgString: string) {
        if (this.mainForm.gameScene.noDanmu.toLowerCase() === 'true') return;

        // truncate danmu message to certain length
        if (msgString && msgString.length > CommonMethods.danmuMaxLength) {
            msgString = `${msgString.slice(0, CommonMethods.danmuMaxLength)}...(略)`;
        }

        let danmuIndex = 0;
        let foundEmptyDanmu = false;
        let foundDanmu = false;
        if (this.mainForm.gameScene.danmuMessages.length > 0) {
            for (let i = 0; i < this.mainForm.gameScene.danmuMessages.length; i++) {
                if (this.mainForm.gameScene.danmuMessages[i] === undefined) {
                    if (!foundEmptyDanmu) {
                        foundEmptyDanmu = true;
                        danmuIndex = i;
                    }
                } else {
                    foundDanmu = true;
                    if (!foundEmptyDanmu) danmuIndex = i + 1;
                }
            }
        }
        if (!foundDanmu) {
            this.destroyAllDanmuMessages();
        }

        let posY = `calc(${this.mainForm.gameScene.coordinates.danmuPositionY} + ${this.mainForm.gameScene.coordinates.danmuOffset * danmuIndex}px)`;
        let lblDanmu = this.mainForm.gameScene.ui.create.div('', msgString, this.mainForm.gameScene.ui.frameMain);
        lblDanmu.style.color = 'white';
        lblDanmu.style.fontFamily = 'serif';
        lblDanmu.style.fontSize = '25px';
        lblDanmu.style.left = `calc(100%)`;
        lblDanmu.style.top = `calc(${posY})`;
        lblDanmu.style.transition = `left ${CommonMethods.danmuDuration}s`;
        lblDanmu.style['transition-timing-function'] = 'linear';
        lblDanmu.style['white-space'] = 'nowrap';
        lblDanmu.style['z-index'] = CommonMethods.zIndexDanmu;
        this.mainForm.gameScene.danmuMessages[danmuIndex] = lblDanmu;

        setTimeout(() => {
            lblDanmu.style.left = `calc(0% - ${lblDanmu.clientWidth}px)`;
        }, 100);
        setTimeout(() => {
            this.mainForm.gameScene.danmuMessages[danmuIndex] = undefined
            lblDanmu.remove();
        }, (CommonMethods.danmuDuration + 1) * 1000);
    }

    public destroyAllDanmuMessages() {
        if (this.mainForm.gameScene.danmuMessages == null || this.mainForm.gameScene.danmuMessages.length == 0) return;
        this.mainForm.gameScene.danmuMessages.forEach((msg: any) => {
            if (msg) msg.remove();
        });
        this.mainForm.gameScene.danmuMessages = []
    }

    public resetReplay() {
        this.destroyAllCards();
        this.destroyAllShowedCards();
        this.destroyScoreImageAndCards();
        this.mainForm.tractorPlayer.destroyAllClientMessages();
    }
}
