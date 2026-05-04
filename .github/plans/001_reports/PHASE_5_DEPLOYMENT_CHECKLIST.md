# ✅ Phase 5 Deployment Checklist

## Pre-Deployment Verification ✅

- [x] All workflow files syntactically valid
- [x] All configuration files valid JSON/YAML
- [x] Coverage thresholds configured
- [x] Job dependencies properly set
- [x] Artifact upload configured
- [x] Secrets properly parameterized
- [x] Documentation complete
- [x] No breaking changes to existing workflows

## Immediate Actions (Do First)

### 1️⃣ Configure GitHub Secrets (5 min)

**Location:** Settings → Secrets and variables → Actions

```bash
# Add these secrets:
SONAR_TOKEN=xxxx (get from https://sonarcloud.io)
EXPO_TOKEN=xxxx (get from https://expo.dev)
```

**Status:** [ ] SONAR_TOKEN configured
**Status:** [ ] EXPO_TOKEN configured

### 2️⃣ Apply Branch Protection Rules (5 min)

**Location:** Settings → Branches → Add rule

**For `main` branch:**
```
Branch name pattern: main
✓ Require a pull request before merging
  ✓ Require approvals: 1
  ✓ Dismiss stale PR approvals
✓ Require status checks
  ✓ CI Pipeline
  ✓ lint
  ✓ test
  ✓ build
  ✓ sonarqube-scan
✓ Require branches to be up to date
```

**For `develop` branch:**
Same as `main`

**Status:** [ ] main branch protected
**Status:** [ ] develop branch protected

### 3️⃣ Create SonarQube Quality Gate (5 min)

**Location:** SonarCloud.io → Your Org → Quality Gates

```
Quality Gate Name: 80% Coverage
Condition: Coverage ≥ 80%
Status: BLOCKING
```

**Status:** [ ] Quality gate created
**Status:** [ ] Status check integration enabled

### 4️⃣ Verify Renovate Bot (2 min)

**Location:** Settings → Applications → Installed GitHub Apps

```
✓ Renovate is installed
✓ Write permissions granted
✓ renovate.json is valid
```

**Status:** [ ] Renovate installed
**Status:** [ ] Bot working (check for PRs)

### 5️⃣ Test CI Workflow (5 min)

**Location:** Actions → CI Pipeline → Run workflow

```
Trigger: main branch (manual dispatch)
Wait for: All jobs to complete
Result: All green ✅
```

**Status:** [ ] Workflow triggered
**Status:** [ ] All jobs passed
**Status:** [ ] SonarQube scan completed

---

## Verification Checklist

### Workflow Execution
- [ ] CI Pipeline triggers on push to main/develop
- [ ] CI Pipeline triggers on PR to main/develop
- [ ] All 6 jobs execute in correct order
- [ ] Lint job passes
- [ ] Test job passes with coverage
- [ ] Build job completes Expo prebuild
- [ ] SonarQube job reports coverage
- [ ] Integration check validates all jobs

### Quality Gates
- [ ] Coverage report uploaded to artifacts
- [ ] Coverage ≥80% check passes
- [ ] SonarQube shows quality gate PASS
- [ ] No code duplication issues
- [ ] No security vulnerabilities flagged

### Dependency Management
- [ ] Renovate creates PRs for updates
- [ ] Patch updates auto-merge when CI passes
- [ ] Minor updates auto-merge when CI passes
- [ ] Major updates create DRAFT PRs
- [ ] Commit messages follow semantic format

### Performance
- [ ] EAS cache hits on second build
- [ ] Gradle cache reduces build time
- [ ] NPM cache reduces install time
- [ ] Total CI time < 12 minutes (cached)

---

## Post-Deployment Validation

### 1. Create a test PR
- Push branch to repo
- Create PR to main
- Verify CI workflow triggered
- Check all jobs executed
- Approve and merge if tests pass

### 2. Monitor Renovate
- Wait 24 hours for dependency scan
- Verify PRs are created for new versions
- Check auto-merge happens for safe packages
- Verify draft PRs for major versions

### 3. Review SonarQube Reports
- Go to SonarCloud dashboard
- Check coverage percentage
- Verify quality gate status
- Review any code issues flagged

### 4. Document Results
- [ ] Update team wiki with CI process
- [ ] Document secret rotation procedure
- [ ] Add CI troubleshooting guide
- [ ] Create runbooks for common issues

---

## Troubleshooting Guide

### CI Workflow Fails

**Problem:** lint job fails
```
Check: npm run lint output
Action: Fix ESLint errors, commit, push
```

**Problem:** SonarQube scan fails
```
Check: SONAR_TOKEN configured?
Action: Verify token in GitHub secrets
```

**Problem:** Build time > 10 minutes
```
Check: Is cache enabled in eas.json?
Action: Clear cache, rebuild to warm up cache
```

### Renovate Issues

**Problem:** Renovate not creating PRs
```
Check: Is bot installed?
Action: Go to GitHub Apps, install Renovate
```

**Problem:** Auto-merge not working
```
Check: Do CI checks pass?
Action: Verify all workflow jobs complete successfully
```

### Branch Protection

**Problem:** Can't merge PR despite checks passing
```
Check: Are all status checks configured?
Action: Go to Settings → Branches, verify required checks
```

---

## Final Sign-Off

| Item | Status | Date |
|------|--------|------|
| All deliverables created | ✅ | 2026-05-04 |
| YAML/JSON validated | ✅ | 2026-05-04 |
| Documentation complete | ✅ | 2026-05-04 |
| Ready for secrets config | ✅ | 2026-05-04 |
| Secrets configured | [ ] | __ / __ / 20__ |
| Branch protection applied | [ ] | __ / __ / 20__ |
| SonarQube quality gate created | [ ] | __ / __ / 20__ |
| CI workflow tested | [ ] | __ / __ / 20__ |
| **Phase 5 Deployed** | [ ] | __ / __ / 20__ |

---

## Support & References

- **Main Report:** `.github/plans/001_reports/PHASE_5_COMPLETION_REPORT.md`
- **Workflow:** `.github/workflows/ci.yml`
- **SonarQube:** https://docs.sonarcloud.io/
- **Renovate:** https://www.renovatebot.com/docs/
- **GitHub Actions:** https://docs.github.com/en/actions
- **EAS Build:** https://docs.expo.dev/build/

---

**Generated:** 2026-05-04  
**For:** vzwingma/domotique-mobile  
**Status:** 🟢 READY FOR DEPLOYMENT
