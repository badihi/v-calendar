<script>
import CalendarPane from './CalendarPane';
import AttributeStore from '../utils/attributeStore';
import defaults from '../utils/defaults';
import getLocaleDefaults from '../utils/locales';
import { mergeListeners } from '@/mixins';
import {
  todayComps,
  pageIsEqualToPage,
  pageIsBeforePage,
  pageIsAfterPage,
  getPrevPage,
  getNextPage,
  getPageBetweenPages,
  getFirstValidPage,
  getPageForDate,
} from '../utils/helpers';
import JDate from '../utils/jalalidate';

export const GregorianDate = {
  calendar: Date,
  firstDayOfWeek: 1,
  defaultDirection: 'ltr',
  inLeapYear: year => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0,
  daysInMonths: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  daysInMonth: (month, year) => month === 2 && GregorianDate.inLeapYear(year) ? 29 : GregorianDate.daysInMonths[month - 1],
};

export const JalaliDate = {
  calendar: JDate,
  firstDayOfWeek: 7,
  defaultLocale: getLocaleDefaults('fa'),
  defaultDirection: 'rtl',
  inLeapYear: year => (new JDate(year, 11, 30)).getDate() === 30,
  daysInMonth(month, year) {
    if (month <= 6)
      return 31;
    else if (month <= 11 || JalaliDate.inLeapYear(year))
      return 30;
    return 29;
  },
};

export default {
  mixins: [mergeListeners],
  render(h) {
    const getPaneComponent = position =>
      h(CalendarPane, {
        attrs: {
          ...this.$attrs,
          position,
          page: position < 2 ? this.fromPage_ : this.toPage_,
          minPage: position < 2 ? this.minPage_ : this.minToPage,
          maxPage: position < 2 ? this.maxFromPage : this.maxPage_,
          hideRightButton:
            !this.showLinkedButtons &&
            position === 1 &&
            this.isLinked &&
            !this.isVertical,
          hideLeftButton:
            !this.showLinkedButtons &&
            position === 2 &&
            this.isLinked &&
            !this.isVertical,
          paneWidth: this.paneWidth,
          styles: this.themeStyles_,
          attributes: this.attributes_,
          formats: this.formats_,
          calendar: this.calendar,
          navVisibility: this.navVisibility,
        },
        on: this.mergeListeners({
          'update:page': val => {
            if (position < 2) this.fromPage_ = val;
            else this.toPage_ = val;
          },
        }),
        slots: this.$slots,
        scopedSlots: this.$scopedSlots,
      });
    return h(
      'div',
      {
        class: {
          'c-pane-container': true,
          'is-vertical': this.isVertical,
          'is-expanded': this.isExpanded,
        },
        style: this.wrapperStyle,
        ref: 'root',
      },
      [
        getPaneComponent(this.isDoublePaned_ ? 1 : 0),
        ...(this.isDoublePaned_ && [
          h('div', {
            class: 'c-pane-div',
            style: this.dividerStyle,
          }),
          getPaneComponent(2),
        ] || []),
      ],
    );
  },
  name: 'VCalendar',
  components: {
    CalendarPane,
  },
  props: {
    minDate: {
      default: () => null,
    },
    maxDate: {
      default: () => null,
    },
    minPage: Object,
    maxPage: Object,
    fromPage: Object,
    toPage: Object,
    showLinkedButtons: {
      type: Boolean,
      default: () => defaults.showLinkedButtons,
    },
    isDoublePaned: Boolean,
    isLinked: Boolean,
    isVertical: Boolean,
    isExpanded: Boolean,
    paneWidth: { type: Number, default: () => defaults.paneWidth },
    themeStyles: Object,
    attributes: Array,
    formats: Object,
    navVisibility: String,
    calendar: {
      type: Object,
      default: () => GregorianDate,
    },
  },
  data() {
    return {
      isConstrained: true,
      fromPage_: null,
      toPage_: null,
    };
  },
  computed: {
    isDoublePaned_() {
      return this.isDoublePaned && (this.isVertical || !this.isConstrained);
    },
    minPage_() {
      return (
        this.minPage || (this.minDate && getPageForDate(this.minDate, this.calendar)) || null
      );
    },
    rightButtonHidden() {
      return this.position === 1 && this.isLinked && !this.isVertical;
    },
    leftButtonHidden() {
      return this.position === 2 && this.isLinked && !this.isVertical;
    },
    maxPage_() {
      return (
        this.maxPage || (this.maxDate && getPageForDate(this.maxDate, this.calendar)) || null
      );
    },
    maxFromPage() {
      if (this.isDoublePaned_) return getPrevPage(this.maxPage_, this.calendar);
      return this.maxPage_;
    },
    minToPage() {
      if (this.isDoublePaned_) return getNextPage(this.minPage_, this.calendar);
      return null;
    },
    themeStyles_() {
      return {
        ...defaults.themeStyles,
        ...this.themeStyles,
      };
    },
    wrapperStyle() {
      return Object.assign({}, this.themeStyles_.wrapper, { direction: this.calendar.defaultDirection });
    },
    dividerStyle() {
      return this.isVertical
        ? this.themeStyles_.horizontalDivider
        : this.themeStyles_.verticalDivider;
    },
    attributes_() {
      return AttributeStore(this.attributes);
    },
    formats_() {
      return {
        ...defaults.formats,
        ...this.formats,
      };
    },
  },
  watch: {
    fromPage() {
      this.refreshFromPage();
    },
    toPage() {
      this.refreshToPage();
    },
    fromPage_(val, oldVal) {
      if (pageIsEqualToPage(val, oldVal)) return;
      this.$emit('update:frompage', val);
      this.$emit('update:fromPage', val);
      if (!this.isDoublePaned) return;
      if (this.isLinked || !pageIsBeforePage(val, this.toPage_))
        this.toPage_ = getNextPage(val, this.calendar);
    },
    toPage_(val, oldVal) {
      if (pageIsEqualToPage(val, oldVal)) return;
      this.$emit('update:topage', val);
      this.$emit('update:toPage', val);
      if (!this.isDoublePaned) return;
      if (this.isLinked || !pageIsAfterPage(val, this.fromPage_))
        this.fromPage_ = getPrevPage(val, this.calendar);
    },
    isDoublePaned_() {
      this.refreshIsConstrained();
      this.refreshToPage();
    },
    isLinked(val) {
      if (val) this.toPage_ = getNextPage(this.fromPage_, this.calendar);
    },
    isExpanded() {
      this.refreshIsConstrained();
    },
  },
  created() {
    this.refreshFromPage();
    this.refreshToPage();
  },
  mounted() {
    this.$nextTick(() => {
      this.refreshIsConstrained();
      window.addEventListener('resize', this.refreshIsConstrained);
    });
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.refreshIsConstrained);
  },
  methods: {
    refreshFromPage() {
      this.fromPage_ = getFirstValidPage(
        ...[
          this.fromPage,
          { month: todayComps(this.calendar).month, year: todayComps(this.calendar).year },
        ].map(p => getPageBetweenPages(p, this.minPage_, this.maxPage_)),
        this.minPage_,
        getPrevPage(this.maxPage_, this.calendar),
      );
    },
    refreshToPage() {
      this.toPage_ = getFirstValidPage(
        ...[this.toPage, getNextPage(this.fromPage_, this.calendar)].map(p =>
          getPageBetweenPages(p, this.minPage_, this.maxPage_),
        ),
        this.maxPage_,
        getNextPage(this.minPage_, this.calendar),
      );
    },
    refreshIsConstrained() {
      // Get the root calendar element
      const root = this.$refs.root;
      // Only test for constrained environment if needed
      if (!window || !root || !this.isDoublePaned || this.isVertical) {
        this.isConstrained = false;
        // Test for constrained window
      } else if (window && window.innerWidth < 2 * this.paneWidth + 30) {
        this.isConstrained = true;
      } else if (this.isExpanded) {
        this.isConstrained =
          root.parentElement.offsetWidth < 2 * this.paneWidth + 2;
      } else {
        this.isConstrained = false;
      }
    },
  },
};
</script>

<style lang='sass' scoped>

@import '../styles/vars.sass'

.c-pane-container
  flex-shrink: 1
  display: inline-flex
  font-family: $font-family
  font-weight: $font-weight
  line-height: 1.5
  color: $font-color
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  box-sizing: border-box
  &.is-expanded
    width: 100%
  &.is-vertical
    flex-direction: column
  /deep/ *
    box-sizing: inherit
    &:focus
      outline: none

.c-pane-divider
  width: 1px
  border: 1px inset
  border-color: $pane-border-color

</style>
