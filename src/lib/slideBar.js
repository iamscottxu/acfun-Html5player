import { Event } from './event'

let $ = require('jquery');

class SlideBar {
    constructor(element, big = false, vertical = false) {
        let SlideBarElement = $('<div class="ACHtml5Player-slideBar"></div>');
        SlideBarElement.addClass(big ? 'big' : 'small');
        SlideBarElement.addClass(vertical ? 'vertical' : 'horizontal');
        let slideBarFillElement = $('<div class="ACHtml5Player-slideBarFill"></div>');
        let slideBarHandShank = $('<div class="ACHtml5Player-slideBarHandShank"></div>');
        slideBarFillElement.append(slideBarHandShank);
        SlideBarElement.append(slideBarFillElement);
        $(element).append(SlideBarElement);

        let mousedown = false;
        slideBarHandShank.mousedown(() => {
            mousedown = true;
        });

        let _value = 0;

        let _event = new Event();
        _event.add('valuechanged');
        _event.add('valuechangedbyui');

        this.bind = _event.bind;
        this.unbind = _event.unbind;

        $('body').mouseup(() => {
            mousedown = false;
        });

        $('body').mouseleave(() => {
            mousedown = false;
        });

        $('body').mousemove((e) => {
            if (mousedown) {
                if (SlideBarElement.innerHeight() === 0 || SlideBarElement.innerWidth() === 0) {
                    mousedown = false;
                    return;
                }
                let value;
                if (vertical) {
                    let Y = e.pageY - SlideBarElement.offset().top;
                    value = 1 - Y / SlideBarElement.innerHeight();
                } else {
                    let X = e.pageX - SlideBarElement.offset().left;
                    value = X / SlideBarElement.innerWidth();
                }
                _value = value > 1 ? 1 : value < 0 ? 0 : value;
                this.set(_value);
                _event.trigger('valuechangedbyui', { value: _value });
            }
        });

        SlideBarElement.click((e) => {
            if (SlideBarElement.height() === 0 || SlideBarElement.width() === 0) {
                mousedown = false;
                return;
            }
            let value;
            if (vertical) {
                let Y = e.pageY - SlideBarElement.offset().top;
                value = 1 - Y / SlideBarElement.innerHeight();
            } else {
                let X = e.pageX - SlideBarElement.offset().left;
                value = X / SlideBarElement.innerWidth();
            }
            _value = value > 1 ? 1 : value < 0 ? 0 : value;
            this.set(_value);
            _event.trigger('valuechangedbyui', { value: _value });
        });

        this.set = (value) => {
            if (typeof value != 'number' || isNaN(value) || value > 1 || value < 0) throw new TypeError();
            if (vertical) slideBarFillElement.css('height', value * 100 + '%');
            else slideBarFillElement.css('width', value * 100 + '%');
            _event.trigger('valuechanged', { value: value });
        }

        this.get = () => _value;
    }
}

export { SlideBar }