<script>
import Calendar from './Calendar';
import { mergeListeners } from '@/mixins';
import { rangeNormalizer } from '@/utils/pickerProfiles';
import { getType } from '@/utils/typeCheckers';
import { JalaliDate } from './Calendar';

export default {
  mixins: [mergeListeners],
  render(h) {
    return h(Calendar, {
      attrs: {
        ...this.$attrs,
        attributes: this.attributes_,
        themeStyles: this.themeStyles_,
        calendar: this.calendar,
      },
      on: this.mergeListeners({
        dayclick: this.clickDay,
        daymouseenter: this.enterDay,
      }),
      slots: this.$slots,
      scopedSlots: this.$scopedSlots,
    });
  },
  components: {
    Calendar,
  },
  props: {
    value: { type: [Object, Date], default: () => {} },
    isRequired: Boolean,
    dragAttribute: Object,
    selectAttribute: Object,
    disabledAttribute: Object,
    themeStyles: Object,
    attributes: Array,
    minDuration: {
      type: Number,
      default: 0,
    },
    calendar: {
      type: Object,
      default: () => JalaliDate,
    },
  },
  data() {
    return {
      dragValue: null,
      showDisabledContent: false,
    };
  },
  computed: {
    dragAttribute_() {
      return (
        this.dragValue && {
          ...this.dragAttribute,
          dates: [this.dragValue],
        }
      );
    },
    selectAttribute_() {
      return (
        this.value && {
          ...this.selectAttribute,
          dates: [this.value],
        }
      );
    },
    attributes_() {
      const attributes = [...(this.attributes || [])];
      if (this.dragAttribute_) attributes.push(this.dragAttribute_);
      else if (this.selectAttribute_) attributes.push(this.selectAttribute_);
      if (this.disabledAttribute) attributes.push(this.disabledAttribute);
      return attributes;
    },
    themeStyles_() {
      return {
        ...this.themeStyles,
        ...(this.showDisabledContent &&
          this.disabledAttribute && {
            dayContentHover: this.disabledAttribute.contentHoverStyle,
          }),
      };
    },
  },
  watch: {
    dragValue(val) {
      this.$emit('drag', rangeNormalizer(val));
    },
  },
  created() {
    // Clear drag on escape keydown
    document.addEventListener('keydown', e => {
      if (this.dragValue && e.keyCode === 27) {
        this.dragValue = null;
      }
    });
  },
  methods: {
    clickDay({ date }) {
      // Start new drag selection if not dragging
      if (!this.dragValue) {
        // Update drag value if it is valid
        const newDragValue = {
          start: date,
          end: date,
        };
        if (this.dateIsValid(newDragValue, false)) {
          this.dragValue = newDragValue;
        }
      } else {
        // Update selected value if it is valid
        const newValue = rangeNormalizer({
          start: this.dragValue.start,
          end: date,
        });

        // eslint-disable-next-line new-cap
        newValue.start = new (this.calendar.calendar)(newValue.start);
        // eslint-disable-next-line new-cap
        newValue.end = new (this.calendar.calendar)(newValue.end);

        if (this.dateIsValid(newValue, true)) {
          // Clear drag selection
          this.dragValue = null;
          // Signal new value selected
          this.$emit('input', newValue);
        }
      }
    },
    enterDay({ date }) {
      // Make sure drag has been initialized
      if (this.dragValue) {
        // Calculate the new dragged value
        const newDragValue = {
          start: this.dragValue.start,
          end: date,
        };
        // Check if dragged value is valid
        if (this.dateIsValid(newDragValue)) {
          // Update drag selection
          this.dragValue = newDragValue;
          // Show enabled content hover style
          this.showDisabledContent = false;
        } else {
          // Show disabled content hover style
          this.showDisabledContent = true;
        }
      }
    },
    dateIsValid(date, checkMinDuration) {
      const newDate = {
        start: getType(date.start) !== 'Date' ? date.start.getGregorianDate() : date.start,
        end: getType(date.end) !== 'Date' ? date.end.getGregorianDate() : date.end,
      };
      if (checkMinDuration && (newDate.end.getTime() - newDate.start.getTime()) < this.minDuration * 1000 * 24 * 3600) return false;
      return (
        !this.disabledAttribute || !this.disabledAttribute.intersectsDate(newDate)
      );
    },
  },
};
</script>
