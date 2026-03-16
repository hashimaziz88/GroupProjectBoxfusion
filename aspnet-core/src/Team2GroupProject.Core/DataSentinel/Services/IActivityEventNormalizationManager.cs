using Abp.Dependency;

namespace Team2GroupProject.DataSentinel.Services
{
    public interface IActivityEventNormalizationManager : ITransientDependency
    {
        ActivityEvent Normalize(ActivityEvent activityEvent);
    }
}
