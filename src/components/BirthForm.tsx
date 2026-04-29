import { useState, useMemo, useEffect, useImperativeHandle, forwardRef, useRef } from 'react'
import type { BirthInput, Gender, JasiMethod } from '@orrery/core/types'
import { isKoreanDaylightTime, isKoreanHistoricalTimeAnomaly } from '@orrery/core/natal'
import { Lunar } from 'lunar-javascript'
import type { City } from '@orrery/core/cities'
import { SEOUL, formatCityName } from '@orrery/core/cities'
import CityCombobox from './CityCombobox.tsx'
import { useLocale } from '../i18n/index.ts'
import {
  getTimeZoneDisplayLabelAtLocalTime,
  inferTimeZoneFromCoordinates,
  isDaylightSavingInEffect,
  validateBirthLocalTime,
} from '../utils/timezones.ts'
import {
  formatCoordinate,
  isCoordinateDraft,
  parseCoordinateDraft,
  stepCoordinate,
} from '../utils/coordinate-input.ts'
import logo from '../assets/icon-512.png'

export interface BirthFormHandle {
  getCurrentState(): SavedFormState
}

interface Props {
  onSubmit: (input: BirthInput) => void
  externalState?: SavedFormState | null
  onExternalStateConsumed?: () => void
}

const STORAGE_KEY = 'orrery-birth-input'

export interface SavedFormState {
  year: number
  month: number
  day: number
  calendarType?: 'solar' | 'lunar'
  isLeapMonth?: boolean
  hour: number
  minute: number
  gender: Gender
  unknownTime: boolean
  jasiMethod: JasiMethod
  city: City | null
  manualCoords: boolean
  latitude: number
  longitude: number
}

function loadSaved(): SavedFormState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SavedFormState
  } catch {
    return null
  }
}

const now = new Date()
const currentYear = now.getFullYear()
const saved = loadSaved()
const initialLatitude = saved?.latitude ?? SEOUL.lat
const initialLongitude = saved?.longitude ?? SEOUL.lon

const selectClass =
  'w-full h-10 pl-3 pr-8 border border-gray-200 dark:border-gray-700 rounded-lg text-base text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900 ' +
  'appearance-none bg-[length:16px_16px] bg-[position:right_8px_center] bg-no-repeat ' +
  "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%239ca3af%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] " +
  'focus:outline-none focus:ring-2 focus:ring-gray-800/20 dark:focus:ring-gray-200/20 focus:border-gray-400 dark:focus:border-gray-500 ' +
  'transition-all disabled:opacity-40 disabled:bg-gray-50 dark:disabled:bg-gray-800'

const inputClass =
  'w-full h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg text-base text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900 ' +
  'focus:outline-none focus:ring-2 focus:ring-gray-800/20 dark:focus:ring-gray-200/20 focus:border-gray-400 dark:focus:border-gray-500 transition-all'


const BirthForm = forwardRef<BirthFormHandle, Props>(function BirthForm({ onSubmit, externalState, onExternalStateConsumed }, ref) {
  const { t } = useLocale()
  const [year, setYear] = useState(saved?.year ?? currentYear - 20)
  const [month, setMonth] = useState(saved?.month ?? now.getMonth() + 1)
  const [day, setDay] = useState(saved?.day ?? now.getDate())
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>(saved?.calendarType ?? 'solar')
  const [isLeapMonth, setIsLeapMonth] = useState(saved?.isLeapMonth ?? false)
  const [hour, setHour] = useState(saved?.hour ?? now.getHours())
  const [minute, setMinute] = useState(saved?.minute ?? now.getMinutes())
  const [gender, setGender] = useState<Gender>(saved?.gender ?? 'M')
  const [unknownTime, setUnknownTime] = useState(saved?.unknownTime ?? false)
  const [jasiMethod, setJasiMethod] = useState<JasiMethod>(saved?.jasiMethod ?? 'unified')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedCity, setSelectedCity] = useState<City | null>(saved?.city ?? SEOUL)
  const [manualCoords, setManualCoords] = useState(saved?.manualCoords ?? false)
  const [latitude, setLatitude] = useState(initialLatitude)
  const [longitude, setLongitude] = useState(initialLongitude)
  const [latitudeInput, setLatitudeInput] = useState(() => formatCoordinate(initialLatitude))
  const [longitudeInput, setLongitudeInput] = useState(() => formatCoordinate(initialLongitude))
  const [timezoneError, setTimezoneError] = useState<string | null>(null)
  const [autoCalcReady, setAutoCalcReady] = useState(false)
  const lastAutoSubmitKeyRef = useRef('')

  const inferredTimezone = useMemo(
    () => inferTimeZoneFromCoordinates(latitude, longitude),
    [latitude, longitude],
  )
  const locationSummary = useMemo(() => {
    if (manualCoords) {
      return `${t('form.coordInput')} · ${t('form.latitude')} ${latitude.toFixed(4)} · ${t('form.longitude')} ${longitude.toFixed(4)}`
    }
    if (selectedCity) {
      return `${formatCityName(selectedCity)} · ${t('form.latitude')} ${latitude.toFixed(4)} · ${t('form.longitude')} ${longitude.toFixed(4)}`
    }
    return `${t('form.latitude')} ${latitude.toFixed(4)} · ${t('form.longitude')} ${longitude.toFixed(4)}`
  }, [manualCoords, selectedCity, latitude, longitude, t])
  const effectiveDate = useMemo(() => {
    if (calendarType === 'solar') return { year, month, day }
    try {
      const lunarMonth = isLeapMonth ? -month : month
      const solar = Lunar.fromYmd(year, lunarMonth, day).getSolar()
      return {
        year: solar.getYear(),
        month: solar.getMonth(),
        day: solar.getDay(),
      }
    } catch {
      return null
    }
  }, [calendarType, isLeapMonth, year, month, day])

  const timezoneDisplayLabel = useMemo(() => {
    if (!inferredTimezone) return null
    const date = effectiveDate
    if (!date) return null
    return getTimeZoneDisplayLabelAtLocalTime(
      inferredTimezone,
      date.year,
      date.month,
      date.day,
      unknownTime ? 12 : hour,
      unknownTime ? 0 : minute,
    )
  }, [inferredTimezone, effectiveDate, hour, minute, unknownTime])

  function getTimezoneValidationError(state: SavedFormState): string | null {
    const effectiveHour = state.unknownTime ? 12 : state.hour
    const effectiveMinute = state.unknownTime ? 0 : state.minute
    const result = validateBirthLocalTime(
      state.latitude, state.longitude,
      state.year, state.month, state.day,
      effectiveHour, effectiveMinute,
    )
    if (result.ok) return null
    if (result.reason === 'dst-gap') return t('form.dstGapError')
    return t('form.timezoneAutoDetectFailed')
  }

  function buildBirthInput(state: SavedFormState): BirthInput | null {
    let date = { year: state.year, month: state.month, day: state.day }
    if ((state.calendarType ?? 'solar') === 'lunar') {
      try {
        const lunarMonth = (state.isLeapMonth ?? false) ? -state.month : state.month
        const solar = Lunar.fromYmd(state.year, lunarMonth, state.day).getSolar()
        date = {
          year: solar.getYear(),
          month: solar.getMonth(),
          day: solar.getDay(),
        }
      } catch {
        return null
      }
    }

    const effectiveStateTimezone = inferTimeZoneFromCoordinates(state.latitude, state.longitude)
    const validationState: SavedFormState = {
      ...state,
      year: date.year,
      month: date.month,
      day: date.day,
      calendarType: 'solar',
    }
    if (getTimezoneValidationError(validationState)) return null
    if (!effectiveStateTimezone) return null
    return {
      year: date.year,
      month: date.month,
      day: date.day,
      hour: state.unknownTime ? 12 : state.hour,
      minute: state.unknownTime ? 0 : state.minute,
      gender: state.gender,
      unknownTime: state.unknownTime,
      ...(!state.unknownTime && { jasiMethod: state.jasiMethod }),
      latitude: state.latitude,
      longitude: state.longitude,
      timezone: effectiveStateTimezone,
    }
  }

  useImperativeHandle(ref, () => ({
    getCurrentState: (): SavedFormState => ({
      year, month, day, calendarType, isLeapMonth, hour, minute, gender, unknownTime, jasiMethod,
      city: selectedCity, manualCoords, latitude, longitude,
    }),
  }))

  useEffect(() => {
    setTimezoneError(null)
  }, [latitude, longitude])

  function syncCoordinates(nextLatitude: number, nextLongitude: number) {
    setLatitude(nextLatitude)
    setLongitude(nextLongitude)
    setLatitudeInput(formatCoordinate(nextLatitude))
    setLongitudeInput(formatCoordinate(nextLongitude))
  }

  function applyLatitude(nextLatitude: number) {
    setLatitude(nextLatitude)
    setLatitudeInput(formatCoordinate(nextLatitude))
  }

  function applyLongitude(nextLongitude: number) {
    setLongitude(nextLongitude)
    setLongitudeInput(formatCoordinate(nextLongitude))
  }

  function handleCoordinateChange(
    value: string,
    setDraft: (value: string) => void,
    setValue: (value: number) => void,
  ) {
    if (!isCoordinateDraft(value)) return

    setDraft(value)

    const parsed = parseCoordinateDraft(value)
    if (parsed != null) setValue(parsed)
  }

  function handleCoordinateKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    draft: string,
    current: number,
    apply: (value: number) => void,
  ) {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return

    e.preventDefault()
    const baseValue = parseCoordinateDraft(draft) ?? current
    apply(stepCoordinate(baseValue, e.key === 'ArrowUp' ? 1 : -1))
  }

  useEffect(() => {
    if (!externalState) return
    const s = externalState
    setYear(s.year)
    setMonth(s.month)
    setDay(s.day)
    setCalendarType(s.calendarType ?? 'solar')
    setIsLeapMonth(s.isLeapMonth ?? false)
    setHour(s.hour)
    setMinute(s.minute)
    setGender(s.gender)
    setUnknownTime(s.unknownTime)
    setJasiMethod(s.jasiMethod)
    setSelectedCity(s.city)
    setManualCoords(s.manualCoords)
    syncCoordinates(s.latitude, s.longitude)
    setTimezoneError(null)
    onExternalStateConsumed?.()
    const birthInput = buildBirthInput(s)
    if (birthInput) onSubmit(birthInput)
  }, [externalState]) // eslint-disable-line react-hooks/exhaustive-deps

  const isKDT = useMemo(
    () => inferredTimezone === 'Asia/Seoul' && !!effectiveDate && isKoreanDaylightTime(effectiveDate.year, effectiveDate.month, effectiveDate.day),
    [inferredTimezone, effectiveDate],
  )
  const isKstHistoricalAnomaly = useMemo(
    () => inferredTimezone === 'Asia/Seoul' && !!effectiveDate && isKoreanHistoricalTimeAnomaly(effectiveDate.year, effectiveDate.month, effectiveDate.day),
    [inferredTimezone, effectiveDate],
  )
  const isDstActive = useMemo(() => {
    if (!inferredTimezone) return false
    if (isKDT || isKstHistoricalAnomaly) return false
    return isDaylightSavingInEffect(
      inferredTimezone,
      effectiveDate?.year ?? year,
      effectiveDate?.month ?? month,
      effectiveDate?.day ?? day,
      unknownTime ? 12 : hour,
      unknownTime ? 0 : minute,
    )
  }, [inferredTimezone, isKDT, isKstHistoricalAnomaly, effectiveDate, year, month, day, hour, minute, unknownTime])

  function handleCitySelect(city: City) {
    setSelectedCity(city)
    syncCoordinates(city.lat, city.lon)
    setTimezoneError(null)
  }

  function resolveCoordinates() {
    const resolvedLatitude = manualCoords ? parseCoordinateDraft(latitudeInput) : latitude
    const resolvedLongitude = manualCoords ? parseCoordinateDraft(longitudeInput) : longitude
    if (resolvedLatitude == null || resolvedLongitude == null) return null
    return { resolvedLatitude, resolvedLongitude }
  }

  function submitWithCurrentState(showValidationError: boolean) {
    const resolved = resolveCoordinates()
    if (!resolved) {
      if (showValidationError) setTimezoneError(t('form.coordinateInvalid'))
      return false
    }

    if (manualCoords) syncCoordinates(resolved.resolvedLatitude, resolved.resolvedLongitude)

    const state: SavedFormState = {
      year, month, day, calendarType, isLeapMonth, hour, minute, gender, unknownTime, jasiMethod,
      city: selectedCity, manualCoords, latitude: resolved.resolvedLatitude, longitude: resolved.resolvedLongitude,
    }
    const validationError = getTimezoneValidationError(state)
    if (validationError) {
      if (showValidationError) setTimezoneError(validationError)
      return false
    }

    setTimezoneError(null)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* quota exceeded — ignore */ }
    const birthInput = buildBirthInput(state)
    if (!birthInput) {
      if (showValidationError && state.calendarType === 'lunar') {
        setTimezoneError(t('form.lunarInvalid'))
      }
      return false
    }
    onSubmit(birthInput)
    setAutoCalcReady(true)
    return true
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    submitWithCurrentState(true)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const resolved = resolveCoordinates()
      if (!resolved) return
      const key = [
        year, month, day, hour, minute, gender, unknownTime, jasiMethod,
        calendarType, isLeapMonth,
        manualCoords, resolved.resolvedLatitude, resolved.resolvedLongitude,
      ].join('|')
      if (lastAutoSubmitKeyRef.current === key) return
      if (submitWithCurrentState(false)) {
        lastAutoSubmitKeyRef.current = key
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [year, month, day, hour, minute, gender, unknownTime, jasiMethod, calendarType, isLeapMonth, manualCoords, latitude, longitude, latitudeInput, longitudeInput]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm dark:shadow-none">
      <div className="flex flex-col items-center md:flex-row md:items-start gap-5">
        {/* 로고 */}
        <div className="flex flex-col items-center shrink-0">
          <img
            src={logo}
            alt="혼천의"
            className="w-48 md:w-64"
          />
          <span className="text-base text-gray-400 dark:text-gray-500 font-hanja -mt-1">혼천의(渾天儀)</span>
        </div>

        {/* 폼 필드 전체 */}
        <div className="w-full min-w-0">
          {/* 생년월일 */}
          <fieldset>
            <legend className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('form.birthDate')}</legend>
            <div className="inline-flex h-10 rounded-lg bg-gray-100 dark:bg-gray-800 p-1 mb-2">
              <button
                type="button"
                onClick={() => {
                  setCalendarType('solar')
                  setIsLeapMonth(false)
                }}
                className={`px-4 text-sm rounded-md transition-all ${
                  calendarType === 'solar'
                    ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm font-medium'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {t('form.solar')}
              </button>
              <button
                type="button"
                onClick={() => setCalendarType('lunar')}
                className={`px-4 text-sm rounded-md transition-all ${
                  calendarType === 'lunar'
                    ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm font-medium'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {t('form.lunar')}
              </button>
            </div>
            {calendarType === 'lunar' && (
              <div className="inline-flex h-9 rounded-lg bg-gray-100 dark:bg-gray-800 p-1 mb-2">
                <button
                  type="button"
                  onClick={() => setIsLeapMonth(false)}
                  className={`px-3 text-xs rounded-md transition-all ${
                    !isLeapMonth
                      ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm font-medium'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  {t('form.lunarRegular')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsLeapMonth(true)}
                  className={`px-3 text-xs rounded-md transition-all ${
                    isLeapMonth
                      ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm font-medium'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  {t('form.lunarLeap')}
                </button>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              <select
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className={selectClass}
              >
                {Array.from({ length: currentYear - 1900 + 1 }, (_, i) => {
                  const y = currentYear - i
                  return <option key={y} value={y}>{`${y}${t('form.yearSuffix')}`}</option>
                })}
              </select>
              <select
                value={month}
                onChange={e => setMonth(Number(e.target.value))}
                className={selectClass}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{`${i + 1}${t('form.monthSuffix')}`}</option>
                ))}
              </select>
              <select
                value={day}
                onChange={e => setDay(Number(e.target.value))}
                className={selectClass}
              >
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{`${i + 1}${t('form.daySuffix')}`}</option>
                ))}
              </select>
            </div>
          </fieldset>

          {isKDT && (
            <div className="mt-2 px-3 py-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
              {t('form.kdt')}
            </div>
          )}
          {!isKDT && isKstHistoricalAnomaly && (
            <div className="mt-2 px-3 py-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
              {t('form.kstHistoricalOffset')}
            </div>
          )}

          {/* 시간 + 성별 */}
          <fieldset className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <legend className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('form.time')}</legend>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={unknownTime}
                  onChange={e => setUnknownTime(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-[18px] bg-gray-200 dark:bg-gray-700 rounded-full peer-checked:bg-gray-800 dark:peer-checked:bg-gray-200 relative transition-colors after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:w-3 after:h-3 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-3.5" />
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('form.unknown')}</span>
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_auto] gap-2 items-end">
              <select
                value={hour}
                onChange={e => setHour(Number(e.target.value))}
                disabled={unknownTime}
                className={selectClass}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{`${String(i).padStart(2, '0')}${t('form.hourSuffix')}`}</option>
                ))}
              </select>
              <select
                value={minute}
                onChange={e => setMinute(Number(e.target.value))}
                disabled={unknownTime}
                className={selectClass}
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i}>{`${String(i).padStart(2, '0')}${t('form.minuteSuffix')}`}</option>
                ))}
              </select>

              {/* 성별 — segmented control */}
              <div>
                <div className="inline-flex h-10 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                  {(['M', 'F'] as const).map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`px-4 text-base rounded-md transition-all ${
                        gender === g
                          ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm font-medium'
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      {g === 'M' ? t('form.male') : t('form.female')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </fieldset>

          {/* 위치 */}
          <fieldset className="mt-4">
            <legend className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('form.birthPlace')}</legend>
            <div className="inline-flex h-10 rounded-lg bg-gray-100 dark:bg-gray-800 p-1 mb-2">
              <button
                type="button"
                onClick={() => {
                  setManualCoords(false)
                  setTimezoneError(null)
                  if (selectedCity) {
                    syncCoordinates(selectedCity.lat, selectedCity.lon)
                  }
                }}
                className={`px-4 text-base rounded-md transition-all ${
                  !manualCoords
                    ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm font-medium'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {t('form.citySearch')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setManualCoords(true)
                  setTimezoneError(null)
                }}
                className={`px-4 text-base rounded-md transition-all ${
                  manualCoords
                    ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm font-medium'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {t('form.coordInput')}
              </button>
            </div>
            {manualCoords ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-gray-400 dark:text-gray-500 mb-1">{t('form.latitude')}</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={latitudeInput}
                    onChange={e => handleCoordinateChange(e.target.value, setLatitudeInput, setLatitude)}
                    onBlur={() => setLatitudeInput(formatCoordinate(latitude))}
                    onKeyDown={e => handleCoordinateKeyDown(e, latitudeInput, latitude, applyLatitude)}
                    autoComplete="off"
                    spellCheck={false}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 dark:text-gray-500 mb-1">{t('form.longitude')}</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={longitudeInput}
                    onChange={e => handleCoordinateChange(e.target.value, setLongitudeInput, setLongitude)}
                    onBlur={() => setLongitudeInput(formatCoordinate(longitude))}
                    onKeyDown={e => handleCoordinateKeyDown(e, longitudeInput, longitude, applyLongitude)}
                    autoComplete="off"
                    spellCheck={false}
                    className={inputClass}
                  />
                </div>
              </div>
            ) : (
              <>
                <CityCombobox selectedCity={selectedCity} onSelect={handleCitySelect} />
                <p className="mt-1.5 text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
                  {locationSummary}
                </p>
              </>
            )}
            {manualCoords && (
              <p className="mt-1.5 text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
                {locationSummary}
              </p>
            )}
            {timezoneDisplayLabel && (
              <p className="mt-1.5 text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
                {t('form.timezoneDefault')} {timezoneDisplayLabel}
                {isDstActive && (
                  <span className="block text-xs mt-0.5">
                    ↳ {t('form.dstActive')}
                  </span>
                )}
              </p>
            )}
            {timezoneError && (
              <div className="mt-2 px-3 py-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400 leading-relaxed">
                {timezoneError}
              </div>
            )}
          </fieldset>

          {/* 고급 설정 */}
          {!unknownTime && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(v => !v)}
                className="flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg
                  className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                {t('form.advanced')}
              </button>
              {showAdvanced && (
                <fieldset className="mt-2">
                  <legend className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('form.jasiMethod')}</legend>
                  <div className="inline-flex h-10 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                    {([
                      { value: 'unified' as const, label: t('form.unified') },
                      { value: 'split' as const, label: t('form.split') },
                    ]).map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setJasiMethod(opt.value)}
                        className={`px-4 text-base rounded-md transition-all ${
                          jasiMethod === opt.value
                            ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm font-medium'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
                    {jasiMethod === 'unified'
                      ? t('form.unifiedDesc')
                      : t('form.splitDesc')}
                  </p>
                </fieldset>
              )}
            </div>
          )}

          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              {autoCalcReady ? '입력 변경 시 자동으로 계산됩니다.' : '입력을 완료하면 자동 계산됩니다.'}
            </p>
            <button
              type="button"
              onClick={() => submitWithCurrentState(true)}
              className="h-10 px-4 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-700 dark:hover:bg-gray-300 active:scale-[0.98] transition-all"
            >
              수동 재계산
            </button>
          </div>

          <p className="mt-3 text-center text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
            🔒 {t('form.privacy1')}<br />
            {t('form.privacy2')}
          </p>
          <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            입력하신 생년월일 정보는 서버에 저장되지 않으며, 브라우저 내에서 계산 후 즉시 파기됩니다
          </p>
        </div>
      </div>
    </form>
  )
})

export default BirthForm
