# Audit fonctionnel V2 — suivi des recommandations

## Synthèse

Le repo couvre maintenant les fondations attendues pour une V2 exploitable : authentification Supabase, pages métier protégées, module d'import Excel contrôlé, schéma d'import, audit log, RLS de base et outillage de build/test. Les écrans métier hors import restent volontairement raccordés à des données de démonstration : ils exposent la structure UI cible, mais doivent encore être branchés aux requêtes serveur filtrées pour être pleinement opérationnels en production.

## Couverture des exigences

| Exigence | Statut | Implémentation |
| --- | --- | --- |
| Upload `.xlsx/.xls` | Couvert | `/import-excel` + `/api/import-excel/upload` |
| Type d'import recommandations/actions/canevas | Couvert UI/API | Le type est enregistré dans `import_batches`; la confirmation métier détaillée est actuellement centrée recommandations/actions. |
| Prévisualisation avant import | Couvert | Batch `PREVIEW`, lignes brutes JSON, import final séparé. |
| Détection colonnes | Couvert | `detectColumnMapping` avec normalisation accents/ponctuation. |
| Mapping manuel | Couvert | Le mapping envoyé à la confirmation revalide maintenant les lignes brutes avant insertion finale. |
| Champs obligatoires | Couvert | Validation Zod par ligne. |
| Erreurs ligne par ligne | Couvert | Table `import_errors` + tableau UI. |
| Historique imports | Couvert | `/api/import-excel/history` + tableau historique. |
| Lignes brutes JSON | Couvert | `import_rows.raw_data`. |
| Doublons fichier/base | Couvert | Doublons fichier au parsing, doublons base à la confirmation. |
| AuditLog import | Couvert | `PREVIEW_CREATED` et `CONFIRMED`. |
| Workflow statuts demandés | Couvert DB | Statuts insérés dans `ParameterSetting`. |
| Tables demandées | Couvert DB | Migration `003_import_excel_workflow.sql` + modèles Prisma. |
| Supabase Auth | Couvert | Login email/mot de passe, cookies httpOnly, proxy validateur. |
| RBAC/RLS | Partiel | RLS service-role + modèle RBAC présents; contrôle fin par permission à brancher page par page. |
| Dashboard/pages métier | Partiel | UI structurée, badges et tableaux; données encore démonstratives hors import. |
| Reporting/export | Partiel | Écran de reporting préparé; exports Excel/PDF/Word à implémenter. |

## Points corrigés dans le rescan

1. Le mapping manuel était affiché côté UI mais n'était pas réappliqué côté confirmation. La confirmation recharge maintenant `raw_data`, applique le mapping transmis, réécrit `mapped_data`, reconstruit `import_errors` puis n'importe que les lignes `VALID`.
2. Le parsing upload ne persistait que les 100 premières lignes de prévisualisation. Toutes les lignes sont maintenant persistées; seules les 100 premières sont renvoyées à l'UI pour éviter une réponse trop lourde.
3. Le champ `expectedDeliverable` était validé mais non inséré. Il est maintenant propagé vers `recommendations.expected_deliverable`.
4. Les helpers d'import sont factorisés et testés (`validateImportRows`, mapping, doublons fichier).

## Risques restants avant production bancaire

- Brancher les pages métier aux requêtes réelles et aux permissions RBAC fines.
- Ajouter des server actions/API de correction cellule par cellule avant confirmation définitive.
- Ajouter les exports comité Excel/PDF/Word et les relances automatiques paramétrées.
- Remplacer les politiques RLS service-role génériques par des politiques par rôle, entité et niveau de confidentialité.
