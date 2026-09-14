import { Link } from "react-router";
import { REVIEW_STATUS_LABEL, type ReviewStatus } from "../data/schemas/content";
import { sourceRecordById } from "../data/sources/records";

/** 来源与审校状态(产品方案 §9.2:未经专家核校的内容需在界面明确说明) */
export function Provenance({
  sourceIds,
  reviewStatus,
}: {
  sourceIds: string[];
  reviewStatus: ReviewStatus;
}) {
  return (
    <div className="provenance">
      <span className={`review-badge review-${reviewStatus}`}>{REVIEW_STATUS_LABEL[reviewStatus]}</span>
      <p className="source-line">
        来源：
        {sourceIds.map((id, index) => {
          const record = sourceRecordById.get(id);
          if (!record) return null;
          return (
            <span key={id}>
              {index > 0 && " · "}
              {record.url ? (
                <a href={record.url} target="_blank" rel="noreferrer">
                  {record.title}
                </a>
              ) : (
                record.title
              )}
            </span>
          );
        })}
        {" · "}
        <Link to="/sources">审校说明</Link>
      </p>
    </div>
  );
}
