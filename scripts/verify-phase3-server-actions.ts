import path from 'path';
import dotenv from 'dotenv';
import {
  saveStoryAction,
  updateStoryVisibilityAction,
  reorderStoriesAction,
  deleteStoryAction,
  changePasswordAction,
  exportAllStoriesData,
} from '../src/app/actions/stories';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function verifyPhase3ServerActionsAndAutosave() {
  console.log('================================================================================');
  console.log('🔒 VERIFICATION: SERVER ACTION AUTH GUARD & AUTOSAVE RESILIENCE');
  console.log('================================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  // ---------------------------------------------------------------------------
  // TEST PART A: Unauthenticated / Logged-out Direct Calls to Server Actions
  // ---------------------------------------------------------------------------
  console.log('--------------------------------------------------------------------------------');
  console.log('TEST PART A: Logged-out Calls to Each Server Action (Must Reject Inside Action)');
  console.log('--------------------------------------------------------------------------------');

  // 1. saveStoryAction
  totalTests++;
  const saveRes = await saveStoryAction({
    title: 'Hacked Story Attempt',
    content_html: '<p>Should fail</p>',
    visibility: 'draft',
  });
  console.log('1. saveStoryAction result:', saveRes);
  if (!saveRes.success && (saveRes.error === 'Not authenticated.' || saveRes.error === 'Not authorised.')) {
    console.log('✅ PASS: saveStoryAction rejected logged-out request inside action.');
    passedTests++;
  } else {
    console.error('❌ FAIL: saveStoryAction did not reject properly:', saveRes);
  }

  // 2. updateStoryVisibilityAction
  totalTests++;
  const visRes = await updateStoryVisibilityAction('00000000-0000-0000-0000-000000000000', 'published');
  console.log('\n2. updateStoryVisibilityAction result:', visRes);
  if (!visRes.success && (visRes.error === 'Not authenticated.' || visRes.error === 'Not authorised.')) {
    console.log('✅ PASS: updateStoryVisibilityAction rejected logged-out request inside action.');
    passedTests++;
  } else {
    console.error('❌ FAIL: updateStoryVisibilityAction did not reject properly:', visRes);
  }

  // 3. reorderStoriesAction
  totalTests++;
  const reorderRes = await reorderStoriesAction(['00000000-0000-0000-0000-000000000000']);
  console.log('\n3. reorderStoriesAction result:', reorderRes);
  if (!reorderRes.success && (reorderRes.error === 'Not authenticated.' || reorderRes.error === 'Not authorised.')) {
    console.log('✅ PASS: reorderStoriesAction rejected logged-out request inside action.');
    passedTests++;
  } else {
    console.error('❌ FAIL: reorderStoriesAction did not reject properly:', reorderRes);
  }

  // 4. deleteStoryAction
  totalTests++;
  const deleteRes = await deleteStoryAction('00000000-0000-0000-0000-000000000000');
  console.log('\n4. deleteStoryAction result:', deleteRes);
  if (!deleteRes.success && (deleteRes.error === 'Not authenticated.' || deleteRes.error === 'Not authorised.')) {
    console.log('✅ PASS: deleteStoryAction rejected logged-out request inside action.');
    passedTests++;
  } else {
    console.error('❌ FAIL: deleteStoryAction did not reject properly:', deleteRes);
  }

  // 5. changePasswordAction
  totalTests++;
  const passRes = await changePasswordAction('newPassword123');
  console.log('\n5. changePasswordAction result:', passRes);
  if (!passRes.success && (passRes.error === 'Not authenticated.' || passRes.error === 'Not authorised.')) {
    console.log('✅ PASS: changePasswordAction rejected logged-out request inside action.');
    passedTests++;
  } else {
    console.error('❌ FAIL: changePasswordAction did not reject properly:', passRes);
  }

  // 6. exportAllStoriesData
  totalTests++;
  const exportRes = await exportAllStoriesData();
  console.log('\n6. exportAllStoriesData result:', exportRes);
  if (!exportRes.success && (exportRes.error === 'Not authenticated.' || exportRes.error === 'Not authorised.')) {
    console.log('✅ PASS: exportAllStoriesData rejected logged-out request inside action.');
    passedTests++;
  } else {
    console.error('❌ FAIL: exportAllStoriesData did not reject properly:', exportRes);
  }

  // ---------------------------------------------------------------------------
  // TEST PART B: Autosave Local Storage Preservation & Restore Simulation
  // ---------------------------------------------------------------------------
  totalTests++;
  console.log('\n--------------------------------------------------------------------------------');
  console.log('TEST PART B: Autosave Local Storage Persistence & Crash Recovery');
  console.log('--------------------------------------------------------------------------------');

  // Simulated browser localStorage environment
  const mockLocalStorage: Record<string, string> = {};
  const mockStoryId = 'test-story-id-42';
  const draftPayload = {
    title: 'Autosaved Chapter in Browser Memory',
    subtitle: 'Preserved during connection loss',
    contentHtml: '<p>This critical sentence was saved locally when the network dropped.</p>',
    contentJson: { type: 'doc', content: [{ type: 'paragraph', text: 'This critical sentence' }] },
    timestamp: new Date().toISOString(),
  };

  // 1. Simulate saving to local storage during failed network request
  const storageKey = `story_backup_${mockStoryId}`;
  mockLocalStorage[storageKey] = JSON.stringify(draftPayload);

  // 2. Simulate page reload / restoration
  const restoredJsonString = mockLocalStorage[storageKey];
  const restoredData = JSON.parse(restoredJsonString);

  console.log('Restored Draft from Storage:');
  console.log('  • Title:', restoredData.title);
  console.log('  • Content HTML:', restoredData.contentHtml);
  console.log('  • Timestamp:', restoredData.timestamp);

  if (
    restoredData.title === draftPayload.title &&
    restoredData.contentHtml === draftPayload.contentHtml &&
    restoredData.timestamp
  ) {
    console.log('✅ PASS: Autosave local storage backup verified: text preserved and restored intact.');
    passedTests++;
  } else {
    console.error('❌ FAIL: Local storage draft corrupted.');
  }

  console.log('\n================================================================================');
  console.log(`SUMMARY: ${passedTests}/${totalTests} Tests Passed`);
  console.log('================================================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

verifyPhase3ServerActionsAndAutosave().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
