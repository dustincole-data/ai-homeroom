import assert from 'node:assert/strict'
import test from 'node:test'
import { isPreviouslyPublished, isSameTopic, shouldCompareWithHistory } from '../scripts/story-dedup.mjs'

const metaVerge = {
  headline: 'Meta turns off the Instagram feature that let users make AI deepfakes of public accounts',
  context: 'Following significant backlash, Meta is turning off the feature it announced this week that let users generate AI images based on content from public Instagram accounts just by tagging them.',
}

const metaBbc = {
  headline: 'Meta pulls new AI image feature after days of backlash',
  context: "Meta's release this week of an AI feature that let people alter Instagram content drew swift blowback.",
}

const metaRnz = {
  headline: 'Meta removes AI feature on Instagram after global backlash',
  context: "Meta has backed down on a controversial feature that allowed people's public Instagram posts to be used by anyone for AI generation.",
}

const metaTechCrunch = {
  headline: 'Meta removes controversial AI feature on Instagram after backlash',
  context: 'Our intent was to provide a useful creative tool and to give people control over whether their public content could be referenced in this way, the company said.',
}

test('treats independent coverage of one event as the same topic', () => {
  assert.equal(isSameTopic(metaVerge, metaBbc), true)
  assert.equal(isSameTopic(metaVerge, metaRnz), true)
  assert.equal(isSameTopic(metaVerge, metaTechCrunch), true)
  assert.equal(isSameTopic(
    { headline: metaVerge.headline },
    { headline: metaTechCrunch.headline },
  ), true)
})

test('does not collapse unrelated stories that merely mention AI', () => {
  assert.equal(isSameTopic(metaVerge, {
    headline: 'Apple sues OpenAI for allegedly stealing hardware secrets',
    context: 'Apple says former engineers shared confidential hardware plans with the AI startup.',
  }), false)
})

test('does not treat the current daily set as prior-day history', () => {
  assert.equal(shouldCompareWithHistory('2026-07-11T09:00:00Z', '2026-07-11T18:00:00Z'), false)
  assert.equal(shouldCompareWithHistory('2026-07-10T23:59:00Z', '2026-07-11T00:01:00Z'), true)
})

test('matches a topic against an earlier daily story', () => {
  assert.equal(isSameTopic(metaBbc, metaRnz), true)
})

test('rejects a new candidate when the same topic was published previously', () => {
  const publishedHistory = [metaVerge]
  assert.equal(isPreviouslyPublished(metaRnz, publishedHistory), true)
  assert.equal(isPreviouslyPublished({
    headline: 'Apple sues OpenAI for allegedly stealing hardware secrets',
    context: 'Apple says former engineers shared confidential hardware plans with the AI startup.',
  }, publishedHistory), false)
})
